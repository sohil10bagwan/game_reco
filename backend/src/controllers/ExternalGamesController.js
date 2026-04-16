import CacheService from '../services/CacheService.js';
import ExternalGameService from '../services/ExternalGameService.js';
import SpecAnalyzerService from '../services/SpecAnalyzerService.js';
import AIGameDiscoveryService from '../services/AIGameDiscoveryService.js';
import Game from '../models/Game.js';

/**
 * @desc   Fetch games from external APIs
 * @route  POST /api/external/fetch-external
 * @access Private/Admin
 */
const fetchExternalGames = async (req, res) => {
  try {
    const { performanceTier = 'Medium', useAllApis = false } = req.body;

    // Validate performance tier
    const validTiers = ['Low', 'Medium', 'High', 'Ultra'];
    if (!validTiers.includes(performanceTier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid performance tier. Must be Low, Medium, High, or Ultra',
      });
    }

    const result = await ExternalGameService.fetchExternalGames(performanceTier, useAllApis);

    res.json({
      success: true,
      message: `Fetched ${result.totalFetched} games from external sources`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external games',
      error: error.message,
    });
  }
};

/**
 * @desc   Get cache statistics
 * @route  GET /api/external/cache-status
 * @access Private/Admin
 */
const getCacheStatus = async (req, res) => {
  try {
    const stats = await CacheService.getCacheStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache status',
      error: error.message,
    });
  }
};

/**
 * @desc   Get all cache entries
 * @route  GET /api/external/cache-entries
 * @access Private/Admin
 */
const getCacheEntries = async (req, res) => {
  try {
    const { page = 1, limit = 50, tier } = req.query;

    const result = await CacheService.getAllCacheEntries({
      page: parseInt(page),
      limit: parseInt(limit),
      tier,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get cache entries',
      error: error.message,
    });
  }
};

/**
 * @desc   Refresh cache for specific specs
 * @route  POST /api/external/refresh-cache/:cacheId
 * @access Private/Admin
 */
const refreshCache = async (req, res) => {
  try {
    const { cacheId } = req.params;
    const { specs } = req.body;

    if (!specs || !specs.ram || !specs.cpu || !specs.gpu || !specs.storage) {
      return res.status(400).json({
        success: false,
        message: 'User specs (ram, cpu, gpu, storage) are required',
      });
    }

    // Fetch new games
    const analysis = SpecAnalyzerService.analyzeSpecs(specs);
    const { games, apiSources } = await ExternalGameService.fetchExternalGames(
      analysis.performanceTier,
      true
    );

    // Update cache
    const cacheResult = await CacheService.refreshCache(specs, games, apiSources);

    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      data: cacheResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh cache',
      error: error.message,
    });
  }
};

/**
 * @desc   Invalidate cache for specific specs
 * @route  DELETE /api/external/invalidate-cache
 * @access Private/Admin
 */
const invalidateCache = async (req, res) => {
  try {
    const { specs } = req.body;

    if (!specs || !specs.ram || !specs.cpu || !specs.gpu || !specs.storage) {
      return res.status(400).json({
        success: false,
        message: 'User specs (ram, cpu, gpu, storage) are required',
      });
    }

    const success = await CacheService.invalidateCache(specs);

    if (success) {
      res.json({
        success: true,
        message: 'Cache invalidated successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Cache entry not found',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
      error: error.message,
    });
  }
};

/**
 * @desc   Clean up expired cache entries
 * @route  POST /api/external/cleanup-cache
 * @access Private/Admin
 */
const cleanupCache = async (req, res) => {
  try {
    const result = await CacheService.cleanupExpiredCache();

    if (result.success) {
      res.json({
        success: true,
        message: `Cleaned up ${result.deletedCount} expired cache entries`,
        data: result,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Cache cleanup failed',
        error: result.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup cache',
      error: error.message,
    });
  }
};

/**
 * @desc   Trigger AI game discovery manually
 * @route  POST /api/external/ai-discover
 * @access Private/Admin
 */
const triggerAiDiscovery = async (req, res) => {
  try {
    const result = await AIGameDiscoveryService.triggerDiscovery();

    res.json({
      success: true,
      message: 'AI discovery completed',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI discovery failed',
      error: error.message,
    });
  }
};

/**
 * @desc   Get AI discovery service status
 * @route  GET /api/external/ai-status
 * @access Private/Admin
 */
const getAiStatus = async (req, res) => {
  try {
    const status = AIGameDiscoveryService.getStatus();

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI status',
      error: error.message,
    });
  }
};

export default {
  fetchExternalGames,
  getCacheStatus,
  getCacheEntries,
  refreshCache,
  invalidateCache,
  cleanupCache,
  triggerAiDiscovery,
  getAiStatus,
};
