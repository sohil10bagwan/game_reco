import express from 'express';
const router = express.Router();
import externalGamesController from '../controllers/ExternalGamesController.js';
import { protect, adminOnly } from '../middleware/Authmiddleware.js';

// All routes are protected and require admin access
router.use(protect);
router.use(adminOnly);

// Fetch games from external APIs
router.post('/fetch-external', externalGamesController.fetchExternalGames);

// Get cache statistics
router.get('/cache-status', externalGamesController.getCacheStatus);

// Get all cache entries (paginated)
router.get('/cache-entries', externalGamesController.getCacheEntries);

// Refresh cache for specific specs
router.post('/refresh-cache/:cacheId', externalGamesController.refreshCache);

// Invalidate cache
router.delete('/invalidate-cache', externalGamesController.invalidateCache);

// Cleanup expired cache entries
router.post('/cleanup-cache', externalGamesController.cleanupCache);

// Trigger AI game discovery
router.post('/ai-discover', externalGamesController.triggerAiDiscovery);

// Get AI discovery service status
router.get('/ai-status', externalGamesController.getAiStatus);

export default router;
