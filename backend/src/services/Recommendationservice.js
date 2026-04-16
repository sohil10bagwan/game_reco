import Game from '../models/Game.js';
import RecommendationLog from '../models/Recommendationlog.js';

/**
 * Core recommendation engine.
 * Takes user hardware specs, compares against all games in DB,
 * returns sorted compatible games with match scores.
 */
const getRecommendations = async (userSpecs, userId = null, page = 1, limit = 20) => {
  const { ram, cpu, gpu, storage } = userSpecs;

  if (!ram || !cpu || !gpu || !storage) {
    throw new Error('All hardware specs (ram, cpu, gpu, storage) are required');
  }

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;
  const skip = (safePage - 1) * safeLimit;

  // Step 1: Let MongoDB do compatibility filtering
  const compatibilityFilter = {
    minRam: { $lte: ram },
    minCpu: { $lte: cpu },
    minGpu: { $lte: gpu },
    storage: { $lte: storage },
  };

  const [result] = await Game.aggregate([
    { $match: compatibilityFilter },
    {
      $addFields: {
        ramScore: {
          $cond: [
            { $and: [{ $gt: ['$minRam', 0] }, { $gte: [ram, '$minRam'] }] },
            { $min: [{ $multiply: [{ $divide: [ram, '$minRam'] }, 25] }, 25] },
            0,
          ],
        },
        cpuScore: {
          $cond: [
            { $and: [{ $gt: ['$minCpu', 0] }, { $gte: [cpu, '$minCpu'] }] },
            { $min: [{ $multiply: [{ $divide: [cpu, '$minCpu'] }, 25] }, 25] },
            0,
          ],
        },
        gpuScore: {
          $cond: [
            { $and: [{ $gt: ['$minGpu', 0] }, { $gte: [gpu, '$minGpu'] }] },
            { $min: [{ $multiply: [{ $divide: [gpu, '$minGpu'] }, 25] }, 25] },
            0,
          ],
        },
        storageScore: {
          $cond: [
            { $and: [{ $gt: ['$storage', 0] }, { $gte: [storage, '$storage'] }] },
            { $min: [{ $multiply: [{ $divide: [storage, '$storage'] }, 25] }, 25] },
            0,
          ],
        },
      },
    },
    {
      $addFields: {
        matchScore: { $round: [{ $add: ['$ramScore', '$cpuScore', '$gpuScore', '$storageScore'] }, 0] },
        compatibilityDetails: {
          ram: { required: '$minRam', user: ram, meets: { $gte: [ram, '$minRam'] } },
          cpu: { required: '$minCpu', user: cpu, meets: { $gte: [cpu, '$minCpu'] } },
          gpu: { required: '$minGpu', user: gpu, meets: { $gte: [gpu, '$minGpu'] } },
          storage: { required: '$storage', user: storage, meets: { $gte: [storage, '$storage'] } },
        },
      },
    },
    { $sort: { matchScore: -1, rating: -1, createdAt: -1 } },
    {
      $facet: {
        games: [{ $skip: skip }, { $limit: safeLimit }],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const totalMatches = result?.total?.[0]?.count || 0;
  const formattedGames = result?.games || [];

  if (!totalMatches) {
    return {
      games: [],
      totalMatches: 0,
      currentPage: safePage,
      totalPages: 0,
      limit: safeLimit,
    };
  }

  // Step 2: Log page result (optional)
  RecommendationLog.create({
    userId,
    userSpecs,
    recommendedGames: formattedGames.map((g) => ({
      gameId: g._id,
      title: g.title,
      matchScore: g.matchScore,
    })),
    totalMatches,
  });

  return {
    games: formattedGames,
    totalMatches,
    currentPage: safePage,
    totalPages: Math.ceil(totalMatches / safeLimit),
    limit: safeLimit,
  };
};

export { getRecommendations };