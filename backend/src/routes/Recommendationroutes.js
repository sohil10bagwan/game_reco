import express from 'express';
const router = express.Router();
import { recommend } from '../controllers/Recommendationcontroller.js';
import { optionalAuth } from '../middleware/Authmiddleware.js';

// Public route with optional authentication
router.post('/', optionalAuth, recommend);

export default router;