import { getRecommendations } from '../services/Recommendationservice.js';
import { recommendationValidationRules, validate } from '../middleware/validationMiddleware.js';
import CacheService from '../services/CacheService.js';
import ExternalGameService from '../services/ExternalGameService.js';
import SpecAnalyzerService from '../services/SpecAnalyzerService.js';

// @desc   Get game recommendations based on user hardware specs
// @route  POST /api/recommend
// @access Public (optionally authenticated)
const recommend = async (req, res) => {
  try {
    // Apply validation middleware
    await Promise.all(recommendationValidationRules.getRecommendations.map(rule => rule.run(req)));
    const validationError = validate(req, res, () => {});
    if (validationError && validationError.statusCode === 400) {
      return;
    }
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const includeExternal = String(req.query.includeExternal || 'false').toLowerCase() === 'true';
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 20;
    const { ram, cpu, gpu, storage } = req.body;

    // Convert to numbers and validate ranges
    const userSpecs = {
      ram: Number(ram),
      cpu: Number(cpu),
      gpu: Number(gpu),
      storage: Number(storage),
    };

    // Additional validation for reasonable ranges
    const specRanges = {
      ram: { min: 0.5, max: 256, unit: 'GB' },
      cpu: { min: 1.0, max: 16.0, unit: 'GHz' },
      gpu: { min: 0.5, max: 100, unit: 'GB' },
      storage: { min: 1, max: 5000, unit: 'GB' }
    };

    // Validate each spec is within reasonable ranges
    for (const [key, range] of Object.entries(specRanges)) {
      const value = userSpecs[key];
      if (value < range.min || value > range.max) {
        return res.status(400).json({
          success: false,
          message: `${key.toUpperCase()} must be between ${range.min} and ${range.max} ${range.unit}`,
          errorCode: 'INVALID_SPEC_RANGE'
        });
      }
    }

    const userId = req.user ? req.user._id : null;

    // Step 1: Check cache first
    let cachedResult = await CacheService.getCachedResult(userSpecs);

    if (cachedResult) {
      const cachedGames = Array.isArray(cachedResult.games) ? cachedResult.games : [];
      const totalMatches = cachedResult.totalMatches ?? cachedGames.length;
      const start = (page - 1) * limit;
      const paginatedGames = cachedGames.slice(start, start + limit);
      const totalPages = Math.ceil(totalMatches / limit) || 1;

      // Cache hit - return cached results
      return res.json({
        success: true,
        message: `Found ${totalMatches} compatible game(s) from cache!`,
        data: {
          games: paginatedGames,
          totalMatches,
          currentPage: page,
          totalPages,
          limit,
          userSpecs,
          performanceTier: cachedResult.performanceTier,
          fromCache: true,
          cacheInfo: {
            specHash: cachedResult.specHash,
            apiSources: cachedResult.apiSources,
            createdAt: cachedResult.createdAt,
            expiresAt: cachedResult.expiresAt,
            accessCount: cachedResult.accessCount,
          },
        },
      });
    }
    // Step 2: Cache miss - analyze specs and fetch from external APIs
    let analysis;
    try {
      analysis = SpecAnalyzerService.analyzeSpecs(userSpecs);
    } catch (specError) {
      throw specError;
    }

    // Step 3: Get recommendations from database first (fast path)
    const result = await getRecommendations(
      userSpecs,
      userId,
      page,
      limit
    );

    let apiSources = ['Manual'];

    // Step 4: Optionally sync with external APIs (explicit opt-in only)
    if (includeExternal) {
      const externalData = await ExternalGameService.fetchExternalGames(analysis.performanceTier, true);
      apiSources = externalData.apiSources.length > 0 ? externalData.apiSources : ['Manual'];
    }

    // Step 5: Cache the full sorted result for future paginated requests
    if (result.totalMatches > 0 && result.allGames && result.allGames.length > 0) {
      try {
        await CacheService.setCachedResult(userSpecs, result.allGames, apiSources);
      } catch (cacheError) {
        // Don't fail the request if caching fails - just log it
      }
    } else {
    }

    const message = result.totalMatches > 0
      ? `Found ${result.totalMatches} compatible game(s) for your system!`
      : 'No compatible games found. Try upgrading your hardware specs.';

    res.json({
      success: true,
      message: message,
      data: {
        games: result.games,
        totalMatches: result.totalMatches,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        limit: result.limit,
        userSpecs,
        performanceTier: analysis.performanceTier,
        fromCache: false,
        externalApiUsed: includeExternal,
        apiSources: apiSources,
        specAnalysis: {
          specHash: analysis.specHash,
          readableHash: analysis.readableHash,
          gpuCategory: analysis.gpuCategory,
          cpuClass: analysis.cpuClass,
        },
      },
    });
  } catch (error) {
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
      errorDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export { recommend };