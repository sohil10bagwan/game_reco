import cron from 'node-cron';
import DeviceSearchCache from '../models/DeviceSearchCache.js';
import ExternalGameSource from '../models/ExternalGameSource.js';
import Game from '../models/Game.js';
import ExternalGameService from './ExternalGameService.js';
import SpecAnalyzerService from './SpecAnalyzerService.js';
import compareHardware from '../utils/Comparehardware.js';

/**
 * AI Game Discovery Service
 * Periodically checks for newly released games and updates cached recommendations
 */

let discoveryJob = null;
let isRunning = false;

/**
 * Find new games compatible with cached device configurations
 */
const discoverCompatibleGames = async () => {
  if (isRunning) {
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  const results = {
    totalCachesChecked: 0,
    newGamesFound: 0,
    cachesUpdated: 0,
    errors: [],
  };

  try {

    // Get all active cache entries
    const activeCaches = await DeviceSearchCache.find({
      expiresAt: { $gt: new Date() },
    }).lean();

    results.totalCachesChecked = activeCaches.length;

    if (activeCaches.length === 0) {
      return results;
    }

    // Fetch newly released games from external APIs
    const newReleases = await ExternalGameService.getNewReleases(7); // Last 7 days

    if (!newReleases || newReleases.length === 0) {
      return results;
    }

    // Process each new release
    for (const release of newReleases) {
      try {
        // Normalize and save the new game
        const normalized = ExternalGameService.normalizeGameData(release, 'RAWG');
        
        // Estimate requirements based on average modern game
        const estimatedReqs = ExternalGameService.estimateRequirementsFromTier('Medium');

        // Create external source record
        let externalSource = await ExternalGameSource.findOne({
          sourceApi: 'RAWG',
          externalId: release.id.toString(),
        });

        if (!externalSource) {
          externalSource = await ExternalGameSource.create({
            ...normalized,
            sourceApi: 'RAWG',
            externalId: release.id.toString(),
            parsedRequirements: estimatedReqs,
            rawData: release,
          });
        }

        // Check if already in main Game collection
        let game = await Game.findOne({ 'externalIds.rawgId': release.id.toString() });

        if (!game) {
          game = await Game.create({
            title: normalized.title,
            description: normalized.description,
            imageUrl: normalized.coverImage,
            genre: normalized.genres.length > 0 ? normalized.genres : ['Indie'],
            platform: normalized.platforms.length > 0 ? normalized.platforms : ['PC'],
            minRam: estimatedReqs.minRam || 8,
            minCpu: estimatedReqs.minCpu || 2.5,
            minGpu: estimatedReqs.minGpu || 4,
            storage: estimatedReqs.minStorage || 50,
            rating: normalized.rating,
            externalIds: { rawgId: release.id.toString() },
            sourceApi: 'RAWG',
            Years: normalized.releaseDate ? new Date(normalized.releaseDate).getFullYear() : undefined,
            version: '1.0',
            developer: normalized.developer || 'Unknown',
            publisher: normalized.publisher || 'Unknown',
          });

          results.newGamesFound++;
        }

        // Check compatibility with each cached configuration
        for (const cache of activeCaches) {
          const userSpecs = cache.userSpecs;
          const comparison = compareHardware(userSpecs, game);

          if (comparison.isCompatible) {
            // Game is compatible with this cache
            const existingGameIndex = cache.games.findIndex(
              (g) => g.gameId?.toString() === game._id.toString()
            );

            if (existingGameIndex === -1) {
              // Add new compatible game to cache
              cache.games.push({
                gameId: game._id,
                title: game.title,
                matchScore: comparison.matchScore,
                imageUrl: game.imageUrl,
                rating: game.rating,
                genres: game.genre,
                platforms: game.platform,
              });

              cache.totalMatches = cache.games.length;
              cache.lastAiRefresh = new Date();

              await cache.save();
              results.cachesUpdated++;
            }
          }
        }
      } catch (error) {
        results.errors.push({
          gameId: release.id,
          error: error.message,
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return results;
  } catch (error) {
    results.errors.push({ critical: error.message });
    return results;
  } finally {
    isRunning = false;
  }
};

/**
 * Schedule the AI discovery job
 * @param {string} cronSchedule - Cron expression (default: daily at 2 AM)
 */
const scheduleDiscovery = (cronSchedule = '0 2 * * *') => {
  if (discoveryJob) {
    return discoveryJob;
  }

  discoveryJob = cron.schedule(cronSchedule, async () => {
    await discoverCompatibleGames();
  }, {
    scheduled: true,
    timezone: 'UTC',
  });
  return discoveryJob;
};

/**
 * Stop the scheduled discovery job
 */
const stopDiscovery = () => {
  if (discoveryJob) {
    discoveryJob.stop();
    discoveryJob = null;
  }
};

/**
 * Manually trigger discovery (for admin use)
 */
const triggerDiscovery = async () => {
  return await discoverCompatibleGames();
};

/**
 * Get discovery job status
 */
const getStatus = () => ({
  isScheduled: discoveryJob !== null,
  isRunning,
  nextRun: discoveryJob ? 'Check cron schedule' : 'Not scheduled',
});

export default {
  scheduleDiscovery,
  stopDiscovery,
  triggerDiscovery,
  discoverCompatibleGames,
  getStatus,
};
