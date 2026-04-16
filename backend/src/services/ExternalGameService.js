import fetch from 'node-fetch';
import Game from '../models/Game.js';
import ExternalGameSource from '../models/ExternalGameSource.js';
import SpecAnalyzerService from './SpecAnalyzerService.js';

/**
 * External Game Service
 * Fetches games from external APIs (RAWG, IGDB, Steam)
 * Normalizes and filters games based on system requirements
 */

// API Base URLs
const RAWG_BASE_URL = 'https://api.rawg.io/api';
const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const STEAM_BASE_URL = 'https://api.steampowered.com';

/**
 * Parse system requirements from text description
 */
const parseSystemRequirements = (requirementsText) => {
  if (!requirementsText) return null;

  const text = requirementsText.toLowerCase();
  const parsed = {
    minRam: null,
    minCpu: null,
    minGpu: null,
    minStorage: null,
  };

  // Parse RAM (look for GB patterns)
  const ramMatch = text.match(/(\d+(?:\.\d+)?)\s*gb\s*(ram|memory)?/i);
  if (ramMatch) {
    parsed.minRam = parseFloat(ramMatch[1]);
  }

  // Parse storage (look for GB patterns with storage keywords)
  const storageMatch = text.match(/(\d+(?:\.\d+)?)\s*gb\s*(storage|space|available)/i);
  if (storageMatch) {
    parsed.minStorage = parseFloat(storageMatch[1]);
  }

  // Parse CPU speed (look for GHz patterns)
  const cpuMatch = text.match(/(\d+(?:\.\d+)?)\s*ghz/i);
  if (cpuMatch) {
    parsed.minCpu = parseFloat(cpuMatch[1]);
  }

  // Parse GPU VRAM (look for MB/GB patterns near gpu/video keywords)
  const vramMatchGb = text.match(/(\d+(?:\.\d+)?)\s*gb\s*(video|vram|graphics memory)/i);
  const vramMatchMb = text.match(/(\d+(?:\.\d+)?)\s*mb\s*(video|vram|graphics memory)/i);
  if (vramMatchGb) {
    parsed.minGpu = parseFloat(vramMatchGb[1]);
  } else if (vramMatchMb) {
    parsed.minGpu = parseFloat(vramMatchMb[1]) / 1024;
  }

  return parsed;
};

/**
 * Normalize platform names from various APIs to match our enum values
 */
const normalizePlatforms = (platforms) => {
  if (!platforms || !Array.isArray(platforms)) return [];
  
  const platformMapping = {
    // PC variants
    'pc': 'PC',
    'windows': 'PC',
    'macos': 'Mac',
    'mac': 'Mac',
    'linux': 'Linux',
    
    // Nintendo variants
    'nintendo switch': 'Nintendo',
    'switch': 'Nintendo',
    'nes': 'Nintendo',
    'snes': 'Nintendo',
    'nintendo 64': 'Nintendo',
    'gamecube': 'Nintendo',
    'wii': 'Nintendo',
    'wii u': 'Nintendo',
    '3ds': 'Nintendo',
    'ds': 'Nintendo',
    'game boy': 'Mobile',
    'playstation portable': 'Mobile',
    'psp': 'Mobile',
    'playstation vita': 'Mobile',
    'ps vita': 'Mobile',
    
    // PlayStation variants
    'playstation': 'PlayStation',
    'playstation 5': 'PlayStation',
    'ps5': 'PlayStation',
    'playstation 4': 'PlayStation',
    'ps4': 'PlayStation',
    'playstation 3': 'PlayStation',
    'ps3': 'PlayStation',
    'playstation 2': 'PlayStation',
    'ps2': 'PlayStation',
    'playstation 1': 'PlayStation',
    'ps1': 'PlayStation',
    'ps': 'PlayStation',
    
    // Xbox variants
    'xbox': 'Xbox',
    'xbox series s/x': 'Xbox',
    'xbox series x': 'Xbox',
    'xbox series s': 'Xbox',
    'xbox one': 'Xbox',
    'xbox 360': 'Xbox',
    
    // Mobile
    'ios': 'Mobile',
    'iphone': 'Mobile',
    'ipad': 'Mobile',
    'android': 'Mobile',
    'mobile': 'Mobile',
    'smartphone': 'Mobile',
  };
  
  return platforms
    .map(p => {
      const platformName = typeof p === 'string' ? p : (p.name || p.platform?.name);
      if (!platformName) return null;
      
      const normalized = platformMapping[platformName.toLowerCase()];
      return normalized || 'PC'; // Default to PC if unknown
    })
    .filter(Boolean);
};

/**
 * Normalize game data from any source to a common format
 */
const normalizeGameData = (gameData, sourceApi) => {
  const normalized = {
    title: gameData.name || gameData.title || 'Unknown',
    description: gameData.description || gameData.short_description || '',
    releaseDate: gameData.released || gameData.first_release_date 
      ? new Date(gameData.released || gameData.first_release_date) 
      : null,
    coverImage: gameData.background_image || gameData.cover?.url || gameData.header_image || '',
    rating: gameData.rating || gameData.total_rating ? gameData.rating / 10 : 0,
    genres: [],
    platforms: [],
    publisher: null,
    developer: null,
    screenshots: [],
    externalIds: {},
    sourceApi,
  };

  if (gameData.genres) {
    normalized.genres = Array.isArray(gameData.genres)
      ? gameData.genres.map((g) => g.name || g).filter(Boolean)
      : [];
  }

  // Use the new platform normalization function
  if (gameData.platforms) {
    normalized.platforms = normalizePlatforms(
      Array.isArray(gameData.platforms)
        ? gameData.platforms.map((p) => p.name || p.platform?.name || p).filter(Boolean)
        : []
    );
  }

  // Extract publisher and developer based on API source
  if (sourceApi === 'RAWG') {
    normalized.externalIds.rawgId = gameData.id?.toString();
    // RAWG provides publishers in publishers array
    if (gameData.publishers && Array.isArray(gameData.publishers) && gameData.publishers.length > 0) {
      normalized.publisher = gameData.publishers[0].name;
    }
    // RAWG provides developers in developers array
    if (gameData.developers && Array.isArray(gameData.developers) && gameData.developers.length > 0) {
      normalized.developer = gameData.developers[0].name;
    }
    // Extract screenshots from RAWG
    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
      normalized.screenshots = gameData.screenshots
        .slice(0, 5) // Limit to 5 screenshots
        .map(ss => ss.image)
        .filter(Boolean);
    }
  } else if (sourceApi === 'IGDB') {
    normalized.externalIds.igdbId = gameData.id?.toString();
    // IGDB provides publishers in involved_companies with publisher flag
    if (gameData.involved_companies && Array.isArray(gameData.involved_companies)) {
      const publisher = gameData.involved_companies.find(ic => ic.publisher);
      if (publisher && publisher.company) {
        normalized.publisher = typeof publisher.company === 'string' ? publisher.company : publisher.company.name;
      }
      const developer = gameData.involved_companies.find(ic => ic.developer);
      if (developer && developer.company) {
        normalized.developer = typeof developer.company === 'string' ? developer.company : developer.company.name;
      }
    }
    // Extract screenshots from IGDB
    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
      normalized.screenshots = gameData.screenshots
        .slice(0, 5)
        .map(ss => {
          // IGDB screenshot can be object with image_id or string URL
          if (typeof ss === 'object' && ss.image_id) {
            return `https://images.igdb.com/igdb/image/upload/t_screenshot/${ss.image_id}.jpg`;
          }
          return typeof ss === 'string' ? ss : null;
        })
        .filter(Boolean);
    }
  } else if (sourceApi === 'Steam') {
    normalized.externalIds.steamId = gameData.appid?.toString() || gameData.id?.toString();
    // Steam provides publishers and developers directly
    if (gameData.publishers && Array.isArray(gameData.publishers) && gameData.publishers.length > 0) {
      normalized.publisher = gameData.publishers[0];
    }
    if (gameData.developers && Array.isArray(gameData.developers) && gameData.developers.length > 0) {
      normalized.developer = gameData.developers[0];
    }
    // Extract screenshots from Steam
    if (gameData.screenshots && Array.isArray(gameData.screenshots)) {
      normalized.screenshots = gameData.screenshots
        .slice(0, 5)
        .map(ss => ss.path_full)
        .filter(Boolean);
    }
  }

  return normalized;
};

/**
 * Estimate system requirements based on performance tier
 */
const estimateRequirementsFromTier = (tier) => {
  switch (tier) {
    case 'Ultra':
      return { minRam: 16, minCpu: 3.5, minGpu: 8, minStorage: 100 };
    case 'High':
      return { minRam: 12, minCpu: 3.0, minGpu: 6, minStorage: 75 };
    case 'Medium':
      return { minRam: 8, minCpu: 2.5, minGpu: 4, minStorage: 50 };
    case 'Low':
    default:
      return { minRam: 4, minCpu: 2.0, minGpu: 2, minStorage: 30 };
  }
};

/**
 * Fetch games from RAWG API
 */
const fetchFromRAWG = async (performanceTier, limit = 50) => {
  try {
    const apiKey = process.env.RAWG_API_KEY;
    
    if (!apiKey) {
      return [];
    }

    const url = `${RAWG_BASE_URL}/games?key=${apiKey}&ordering=-rating&limit=${limit}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`RAWG API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    const games = data.results || [];

    const savedGames = [];
    for (const game of games) {
      try {
        const normalized = normalizeGameData(game, 'RAWG');
        const estimatedReqs = estimateRequirementsFromTier(performanceTier);

        let externalSource = await ExternalGameSource.findOne({
          sourceApi: 'RAWG',
          externalId: game.id.toString(),
        });

        if (!externalSource) {
          externalSource = new ExternalGameSource({
            ...normalized,
            sourceApi: 'RAWG',
            externalId: game.id.toString(),
            parsedRequirements: estimatedReqs,
            performanceTier,
            rawData: game,
          });
          await externalSource.save();
        } else {
        }

        let syncedGame = await Game.findOne({ 'externalIds.rawgId': game.id.toString() });

        if (!syncedGame) {
          syncedGame = new Game({
            title: normalized.title,
            description: normalized.description,
            imageUrl: normalized.coverImage,
            genre: normalized.genres.length > 0 ? normalized.genres : ['Indie'],
            platform: normalized.platforms.length > 0 ? normalized.platforms : ['PC'],
            minRam: estimatedReqs.minRam || 4,
            minCpu: estimatedReqs.minCpu || 2.5,
            minGpu: estimatedReqs.minGpu || 2,
            storage: estimatedReqs.minStorage || 50,
            rating: normalized.rating,
            externalIds: { rawgId: game.id.toString() },
            sourceApi: 'RAWG',
            performanceTier,
            Years: normalized.releaseDate ? new Date(normalized.releaseDate).getFullYear() : undefined,
            version: '1.0',
            developer: normalized.developer || 'Unknown',
            publisher: normalized.publisher || 'Unknown',
            screenshots: normalized.screenshots || [],
          });
          await syncedGame.save();
        } else {
        }

        savedGames.push(syncedGame);
      } catch (error) {
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
          });
        }
        // Continue with next game instead of failing completely
      }
    }
    return savedGames;
  } catch (error) {
    return [];
  }
};

/**
 * Fetch games from IGDB API
 */
const fetchFromIGDB = async (performanceTier, limit = 50) => {
  try {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return [];
    }

    const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    });

    if (!tokenResponse.ok) {
      throw new Error('IGDB auth failed');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const fields = [
      'name',
      'summary',
      'cover.url',
      'genres.name',
      'platforms.name',
      'first_release_date',
      'rating',
      'screenshots.image_id',
      'involved_companies.company.name',
      'involved_companies.publisher',
      'involved_companies.developer',
    ].join(',');

    const query = `fields ${fields}; limit ${limit}; sort rating desc;`;

    const response = await fetch(`${IGDB_BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status}`);
    }

    const games = await response.json();

    const savedGames = [];
    for (const game of games) {
      const normalized = normalizeGameData(game, 'IGDB');
      const estimatedReqs = estimateRequirementsFromTier(performanceTier);

      let externalSource = await ExternalGameSource.findOne({
        sourceApi: 'IGDB',
        externalId: game.id.toString(),
      });

      if (!externalSource) {
        externalSource = await ExternalGameSource.create({
          ...normalized,
          sourceApi: 'IGDB',
          externalId: game.id.toString(),
          parsedRequirements: estimatedReqs,
          performanceTier,
          rawData: game,
        });
      }

      let syncedGame = await Game.findOne({ 'externalIds.igdbId': game.id.toString() });

      if (!syncedGame) {
        syncedGame = await Game.create({
          title: normalized.title,
          description: normalized.description,
          imageUrl: normalized.coverImage?.replace('t_thumb', 't_cover_big') || '',
          genre: normalized.genres.length > 0 ? normalized.genres : ['Indie'],
          platform: normalized.platforms.length > 0 ? normalized.platforms : ['PC'],
          minRam: estimatedReqs.minRam || 4,
          minCpu: estimatedReqs.minCpu || 2.5,
          minGpu: estimatedReqs.minGpu || 2,
          storage: estimatedReqs.minStorage || 50,
          rating: normalized.rating ? normalized.rating / 10 : 0,
          externalIds: { igdbId: game.id.toString() },
          sourceApi: 'IGDB',
          performanceTier,
          Years: normalized.releaseDate ? new Date(normalized.releaseDate).getFullYear() : undefined,
          version: '1.0',
          developer: normalized.developer || 'Unknown',
          publisher: normalized.publisher || 'Unknown',
          screenshots: normalized.screenshots || [],
        });
      }

      savedGames.push(syncedGame);
    }

    return savedGames;
  } catch (error) {
    return [];
  }
};

/**
 * Fetch games from Steam API
 */
const fetchFromSteam = async (performanceTier, limit = 50) => {
  try {
    const apiKey = process.env.STEAM_API_KEY;
    if (!apiKey) {
      return [];
    }

    const url = `https://store.steampowered.com/api/featured?cc=us&l=en_us`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }

    const data = await response.json();
    const allGames = [
      ...(data.large_capsules || []),
      ...(data.featured_win || []),
      ...(data.featured_mac || []),
    ].slice(0, limit);

    const savedGames = [];
    for (const game of allGames) {
      const appId = game.id;
      if (!appId) continue;

      const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      if (!detailsData[appId]?.success) continue;

      const gameData = detailsData[appId].data;
      const normalized = normalizeGameData(gameData, 'Steam');

      let parsedReqs = null;
      if (gameData.pc_requirements) {
        const minReqText = gameData.pc_requirements.minimum || '';
        parsedReqs = parseSystemRequirements(minReqText);
      }

      const estimatedReqs = parsedReqs || estimateRequirementsFromTier(performanceTier);

      let externalSource = await ExternalGameSource.findOne({
        sourceApi: 'Steam',
        externalId: appId.toString(),
      });

      if (!externalSource) {
        externalSource = await ExternalGameSource.create({
          ...normalized,
          sourceApi: 'Steam',
          externalId: appId.toString(),
          parsedRequirements: estimatedReqs,
          performanceTier,
          rawData: gameData,
        });
      }

      let syncedGame = await Game.findOne({ 'externalIds.steamId': appId.toString() });

      if (!syncedGame) {
        syncedGame = await Game.create({
          title: normalized.title,
          description: normalized.description,
          imageUrl: normalized.coverImage,
          genre: normalized.genres.length > 0 ? normalized.genres : ['Indie'],
          platform: ['PC'],
          minRam: estimatedReqs.minRam || 4,
          minCpu: estimatedReqs.minCpu || 2.5,
          minGpu: estimatedReqs.minGpu || 2,
          storage: estimatedReqs.minStorage || 50,
          rating: 0,
          externalIds: { steamId: appId.toString() },
          sourceApi: 'Steam',
          performanceTier,
          Years: gameData.release_date?.coming_soon
            ? undefined
            : new Date(gameData.release_date?.date * 1000).getFullYear(),
          version: '1.0',
          developer: normalized.developer || 'Unknown',
          publisher: normalized.publisher || 'Unknown',
          screenshots: normalized.screenshots || [],
        });
      }

      savedGames.push(syncedGame);
    }

    return savedGames;
  } catch (error) {
    return [];
  }
};

/**
 * Main function to fetch games from all configured external APIs
 */
const fetchExternalGames = async (performanceTier = 'Medium', useAllApis = false) => {
  const allGames = [];
  const apiSources = [];

  if (useAllApis) {
    const [rawgGames, igdbGames, steamGames] = await Promise.all([
      fetchFromRAWG(performanceTier),
      fetchFromIGDB(performanceTier),
      fetchFromSteam(performanceTier),
    ]);

    allGames.push(...rawgGames, ...igdbGames, ...steamGames);
    if (rawgGames.length > 0) apiSources.push('RAWG');
    if (igdbGames.length > 0) apiSources.push('IGDB');
    if (steamGames.length > 0) apiSources.push('Steam');
  } else {
    const rawgGames = await fetchFromRAWG(performanceTier);
    allGames.push(...rawgGames);
    if (rawgGames.length > 0) apiSources.push('RAWG');
  }

  const uniqueGames = allGames.filter(
    (game, index, self) => index === self.findIndex((g) => g.title === game.title)
  );

  return {
    games: uniqueGames,
    apiSources,
    totalFetched: uniqueGames.length,
  };
};

/**
 * Get newly released games from external APIs
 */
const getNewReleases = async (daysBack = 7) => {
  try {
    const apiKey = process.env.RAWG_API_KEY;
    if (!apiKey) return [];

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);
    const formattedDate = fromDate.toISOString().split('T')[0];

    const url = `${RAWG_BASE_URL}/games?key=${apiKey}&dates=${formattedDate}&ordering=-added&limit=50`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    return [];
  }
};

export default {
  fetchExternalGames,
  fetchFromRAWG,
  fetchFromIGDB,
  fetchFromSteam,
  getNewReleases,
  parseSystemRequirements,
  estimateRequirementsFromTier,
};
