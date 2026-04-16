import express from 'express';
const router = express.Router();
import { register, login, getProfile } from '../controllers/Authcontroller.js';
import { protect } from '../middleware/Authmiddleware.js';
import { userValidationRules } from '../middleware/validationMiddleware.js';

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);

export default router;