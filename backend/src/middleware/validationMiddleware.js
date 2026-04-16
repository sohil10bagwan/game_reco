import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Helper function to handle validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const userValidationRules = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('role')
      .optional()
      .isIn(['user', 'admin'])
      .withMessage('Role must be either "user" or "admin"')
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ]
};

// Game validation rules
const gameValidationRules = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\s\-_:.,'!?]+$/)
      .withMessage('Title contains invalid characters'),
    
    body('genre')
      .isArray({ min: 1 })
      .withMessage('At least one genre is required')
      .custom((value) => {
        const validGenres = ['Action', 'RPG', 'Strategy', 'Sports', 'Simulation', 'Horror', 'Adventure', 'FPS', 'Puzzle', 'Racing', 'Fighting', 'MMO', 'Indie'];
        return value.every(genre => validGenres.includes(genre));
      })
      .withMessage('Invalid genre provided'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Cover image must be a valid URL'),
    
    body('minRam')
      .isNumeric()
      .withMessage('Minimum RAM must be a number')
      .isFloat({ min: 0.5, max: 256 })
      .withMessage('Minimum RAM must be between 0.5 and 256 GB'),
    
    body('minCpu')
      .isNumeric()
      .withMessage('Minimum CPU speed must be a number')
      .isFloat({ min: 1.0, max: 16.0 })
      .withMessage('Minimum CPU speed must be between 1.0 and 16.0 GHz'),
    
    body('minGpu')
      .isNumeric()
      .withMessage('Minimum GPU VRAM must be a number')
      .isFloat({ min: 0.5, max: 100 })
      .withMessage('Minimum GPU VRAM must be between 0.5 and 100 GB'),
    
    body('storage')
      .isNumeric()
      .withMessage('Storage requirement must be a number')
      .isFloat({ min: 1, max: 5000 })
      .withMessage('Storage requirement must be between 1 and 5000 GB'),
    
    body('platform')
      .isArray({ min: 1 })
      .withMessage('At least one platform is required')
      .custom((value) => {
        const validPlatforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
        return value.every(platform => validPlatforms.includes(platform));
      })
      .withMessage('Invalid platform provided'),
    
    body('Years')
      .optional()
      .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
      .withMessage(`Release year must be between 1950 and ${new Date().getFullYear() + 1}`),
    
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10')
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    
    body('genre')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one genre is required'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Cover image must be a valid URL'),
    
    body('minRam')
      .optional()
      .isNumeric()
      .withMessage('Minimum RAM must be a number'),
    
    body('minCpu')
      .optional()
      .isNumeric()
      .withMessage('Minimum CPU speed must be a number'),
    
    body('minGpu')
      .optional()
      .isNumeric()
      .withMessage('Minimum GPU VRAM must be a number'),
    
    body('storage')
      .optional()
      .isNumeric()
      .withMessage('Storage requirement must be a number'),
    
    body('platform')
      .optional()
      .isArray({ min: 1 })
      .withMessage('At least one platform is required'),
    
    body('Years')
      .optional()
      .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
      .withMessage(`Release year must be between 1950 and ${new Date().getFullYear() + 1}`),
    
    body('rating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10')
  ]
};

// Recommendation validation rules
const recommendationValidationRules = {
  getRecommendations: [
    body('ram')
      .exists()
      .withMessage('RAM specification is required')
      .isNumeric()
      .withMessage('RAM must be a number')
      .isFloat({ min: 0.5, max: 256 })
      .withMessage('RAM must be between 0.5 and 256 GB'),
    
    body('cpu')
      .exists()
      .withMessage('CPU specification is required')
      .isNumeric()
      .withMessage('CPU speed must be a number')
      .isFloat({ min: 1.0, max: 16.0 })
      .withMessage('CPU speed must be between 1.0 and 16.0 GHz'),
    
    body('gpu')
      .exists()
      .withMessage('GPU specification is required')
      .isNumeric()
      .withMessage('GPU VRAM must be a number')
      .isFloat({ min: 0.5, max: 100 })
      .withMessage('GPU VRAM must be between 0.5 and 100 GB'),
    
    body('storage')
      .exists()
      .withMessage('Storage specification is required')
      .isNumeric()
      .withMessage('Storage must be a number')
      .isFloat({ min: 1, max: 5000 })
      .withMessage('Storage must be between 1 and 5000 GB')
  ]
};

// ID validation middleware
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

// Query parameter validation
const queryValidationRules = {
  games: [
    query('genre')
      .optional()
      .isIn(['Action', 'RPG', 'Strategy', 'Sports', 'Simulation', 'Horror', 'Adventure', 'FPS', 'Puzzle', 'Racing', 'Fighting', 'MMO', 'Indie'])
      .withMessage('Invalid genre'),
    
    query('platform')
      .optional()
      .isIn(['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'])
      .withMessage('Invalid platform'),
    
    query('search')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Search term too long'),

    query('Years')
      .optional()
      .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
      .withMessage(`Release year must be between 1950 and ${new Date().getFullYear() + 1}`),

    query('version')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Version too long'),

    query('developer')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Developer too long'),

    query('publisher')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Publisher too long'),

    query('rating')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Rating must be between 0 and 10'),
      
    
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'title', 'rating', 'releaseYear'])
      .withMessage('Invalid sort field'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be "asc" or "desc"')
  ]
};

export {
  validate,
  userValidationRules,
  gameValidationRules,
  recommendationValidationRules,
  validateId,
  queryValidationRules
};