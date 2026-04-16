import DeviceSearchCache from '../models/DeviceSearchCache.js';
import SpecAnalyzerService from './SpecAnalyzerService.js';

/**
 * Cache Service
 * Manages caching of game recommendation results based on hardware specifications.
 */

// Default cache TTL in hours (from env or default 24 hours)
const CACHE_TTL_HOURS = parseInt(process.env.CACHE_TTL_HOURS) || 24;

/**
 * Get cached recommendations for a given spec configuration
 * @param {Object} specs - User hardware specifications
 * @returns {Promise<Object|null>} Cached result or null if not found/expired
 */
const getCachedResult = async (specs) => {
  try {
    // Validate specs before generating hash
    if (!specs || !specs.ram || !specs.cpu || !specs.gpu || !specs.storage) {
      return null;
    }

    const { hash } = SpecAnalyzerService.generateSpecHash(specs);

    const cacheEntry = await DeviceSearchCache.findOne({
      specHash: hash,
      expiresAt: { $gt: new Date() }, // Only return non-expired entries
    }).populate('games.gameId');

    if (!cacheEntry) {
      return null;
    }

    // Increment access count
    await DeviceSearchCache.findByIdAndUpdate(cacheEntry._id, {
      $inc: { accessCount: 1 },
    });

    // Filter out any games that might have been deleted
    const validGames = cacheEntry.games.filter(g => g.gameId !== null && g.gameId !== undefined);

    if (validGames.length === 0) {
      // If all games are invalid, delete the cache entry
      await DeviceSearchCache.findByIdAndDelete(cacheEntry._id);
      return null;
    }

    return {
      games: validGames,
      totalMatches: validGames.length,
      performanceTier: cacheEntry.performanceTier,
      specHash: cacheEntry.specHash,
      apiSources: cacheEntry.apiSources,
      createdAt: cacheEntry.createdAt,
      expiresAt: cacheEntry.expiresAt,
      accessCount: cacheEntry.accessCount + 1,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Store recommendation results in cache
 * @param {Object} specs - User hardware specifications
 * @param {Array} games - Array of recommended games
 * @param {Array} apiSources - APIs used to fetch the games
 * @returns {Promise<Object>} Cached entry
 */
const setCachedResult = async (specs, games, apiSources = ['Manual']) => {
  try {
    // Validate specs before generating hash
    if (!specs || !specs.ram || !specs.cpu || !specs.gpu || !specs.storage) {
      throw new Error('Invalid user specs. All fields (ram, cpu, gpu, storage) are required.');
    }
    const analysis = SpecAnalyzerService.analyzeSpecs(specs);
    
    const { hash, readableHash } = analysis;

    // Validate hash was generated successfully
    if (!hash) {
      throw new Error('Failed to generate spec hash. Check SpecAnalyzerService.');
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS);

    // Format games for storage - validate games array
    if (!games || games.length === 0) {
      return null;
    }

    const formattedGames = games.map((game) => ({
      gameId: game._id,
      title: game.title,
      matchScore: game.matchScore || 0,
      imageUrl: game.imageUrl || game.coverImage,
      rating: game.rating,
      genres: game.genre || game.genres,
      platforms: game.platform,
    }));

    // Check if cache entry already exists
    let cacheEntry = await DeviceSearchCache.findOne({ specHash: hash });

    if (cacheEntry) {
      // Update existing entry
      cacheEntry.games = formattedGames;
      cacheEntry.totalMatches = formattedGames.length;
      cacheEntry.userSpecs = specs;
      cacheEntry.performanceTier = analysis.performanceTier;
      cacheEntry.expiresAt = expiresAt;
      cacheEntry.apiSources = [...new Set([...cacheEntry.apiSources, ...apiSources])];
      cacheEntry.accessCount = 0; // Reset on update

      await cacheEntry.save();
    } else {
      // Create new entry
      cacheEntry = await DeviceSearchCache.create({
        specHash: hash,
        userSpecs: specs,
        performanceTier: analysis.performanceTier,
        games: formattedGames,
        totalMatches: formattedGames.length,
        apiSources,
        expiresAt,
        accessCount: 0,
      });
    }

    return {
      specHash: cacheEntry.specHash,
      readableHash,
      totalMatches: cacheEntry.totalMatches,
      expiresAt: cacheEntry.expiresAt,
      performanceTier: cacheEntry.performanceTier,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Force refresh cache for a specific spec configuration
 * @param {Object} specs - User hardware specifications
 * @param {Array} games - New array of recommended games
 * @param {Array} apiSources - APIs used
 * @returns {Promise<Object>} Updated cache entry
 */
const refreshCache = async (specs, games, apiSources = ['Manual']) => {
  // Delete existing cache first
  await invalidateCache(specs);
  // Set new cache
  return await setCachedResult(specs, games, apiSources);
};

/**
 * Invalidate cache for a specific spec configuration
 * @param {Object} specs - User hardware specifications
 * @returns {Promise<boolean>} Success status
 */
const invalidateCache = async (specs) => {
  try {
    const { hash } = SpecAnalyzerService.generateSpecHash(specs);
    const result = await DeviceSearchCache.deleteOne({ specHash: hash });
    return result.deletedCount > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Get cache statistics
 * @returns {Promise<Object>} Cache statistics
 */
const getCacheStats = async () => {
  try {
    const now = new Date();

    const totalEntries = await DeviceSearchCache.countDocuments();
    const expiredEntries = await DeviceSearchCache.countDocuments({
      expiresAt: { $lte: now },
    });
    const activeEntries = totalEntries - expiredEntries;

    const tierDistribution = await DeviceSearchCache.aggregate([
      { $match: { expiresAt: { $gt: now } } },
      { $group: { _id: '$performanceTier', count: { $sum: 1 } } },
    ]);

    const avgAccessCount = await DeviceSearchCache.aggregate([
      { $match: { expiresAt: { $gt: now } } },
      { $group: { _id: null, avg: { $avg: '$accessCount' } } },
    ]);

    const oldestCache = await DeviceSearchCache.findOne(
      { expiresAt: { $gt: now } },
      {},
      { sort: { expiresAt: 1 } }
    );

    const newestCache = await DeviceSearchCache.findOne({}, {}, { sort: { createdAt: -1 } });

    return {
      totalEntries,
      activeEntries,
      expiredEntries,
      tierDistribution: tierDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageAccessCount: avgAccessCount.length > 0 ? avgAccessCount[0].avg.toFixed(2) : 0,
      oldestExpiry: oldestCache ? oldestCache.expiresAt : null,
      newestEntry: newestCache ? newestCache.createdAt : null,
      ttlHours: CACHE_TTL_HOURS,
    };
  } catch (error) {
    return {
      totalEntries: 0,
      activeEntries: 0,
      expiredEntries: 0,
      error: error.message,
    };
  }
};

/**
 * Clean up expired cache entries
 * @returns {Promise<Object>} Cleanup results
 */
const cleanupExpiredCache = async () => {
  try {
    const result = await DeviceSearchCache.deleteMany({
      expiresAt: { $lte: new Date() },
    });

    return {
      success: true,
      deletedCount: result.deletedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all cache entries (for admin purposes)
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Cache entries
 */
const getAllCacheEntries = async (options = {}) => {
  const {
    page = 1,
    limit = 50,
    tier = null,
    sortBy = 'createdAt',
    order = -1,
  } = options;

  try {
    const query = {};
    if (tier) {
      query.performanceTier = tier;
    }

    const skip = (page - 1) * limit;

    const entries = await DeviceSearchCache.find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate('games.gameId', 'title imageUrl rating');

    const total = await DeviceSearchCache.countDocuments(query);

    return {
      entries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalEntries: total,
        hasMore: skip + entries.length < total,
      },
    };
  } catch (error) {
    return { entries: [], pagination: {}, error: error.message };
  }
};

export default {
  getCachedResult,
  setCachedResult,
  refreshCache,
  invalidateCache,
  getCacheStats,
  cleanupExpiredCache,
  getAllCacheEntries,
  CACHE_TTL_HOURS,
};
