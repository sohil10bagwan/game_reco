import Game from '../models/Game.js';
import mongoose from 'mongoose';
import { gameValidationRules, validateId, validate } from '../middleware/validationMiddleware.js';

// @desc   Add a new game
// @route  POST /api/games
// @access Private/Admin
const addGame = async (req, res) => {
  try {
    // Apply validation middleware
    await Promise.all(gameValidationRules.create.map(rule => rule.run(req)));
    const validationError = validate(req, res, () => {});
    if (validationError && validationError.statusCode === 400) {
      return;
    }

    const gameData = {
      ...req.body,
      addedBy: req.user._id,
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : undefined
    };

    const game = await Game.create(gameData);
    
    res.status(201).json({ 
      success: true, 
      message: 'Game added successfully', 
      data: game 
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => ({
        field: val.path,
        message: val.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc   Get all games
// @route  GET /api/games
// @access Public
const getAllGames = async (req, res) => {
  try {
    // Validate query parameters
    const allowedSortFields = ['createdAt', 'title', 'rating', 'Years'];
    const allowedOrders = ['asc', 'desc'];
    
    const { genre, platform, search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    // Validate sortBy and order parameters
    if (sortBy && !allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sortBy parameter',
        errorCode: 'INVALID_SORT_FIELD'
      });
    }
    
    if (order && !allowedOrders.includes(order)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be "asc" or "desc"',
        errorCode: 'INVALID_ORDER'
      });
    }
    
    // Validate search length
    if (search && search.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search term too long',
        errorCode: 'SEARCH_TERM_TOO_LONG'
      });
    }
    
    const filter = {};
    
    // Validate genre
    if (genre) {
      const validGenres = ['Action', 'RPG', 'Strategy', 'Sports', 'Simulation', 'Horror', 'Adventure', 'FPS', 'Puzzle', 'Racing', 'Fighting', 'MMO', 'Indie'];
      if (!validGenres.includes(genre)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid genre',
          errorCode: 'INVALID_GENRE'
        });
      }
      filter.genre = { $in: [genre] };
    }
    
    // Validate platform
    if (platform) {
      const validPlatforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid platform',
          errorCode: 'INVALID_PLATFORM'
        });
      }
      filter.platform = { $in: [platform] };
    }
    
    if (search) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const games = await Game.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate('addedBy', 'name');

    res.json({
      success: true,
      count: games.length,
      data: games,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc   Get single game by ID
// @route  GET /api/games/:id
// @access Public
const getGameById = async (req, res) => {
  try {
    // Validate ID format
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID'
      });
    }

    const game = await Game.findById(id).populate('addedBy', 'name');
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        errorCode: 'GAME_NOT_FOUND'
      });
    }
    
    res.json({ 
      success: true, 
      data: game 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc   Update a game
// @route  PUT /api/games/:id
// @access Private/Admin
const updateGame = async (req, res) => {
  try {
    // Validate ID format
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID'
      });
    }
    
    // Apply validation middleware for update
    await Promise.all(gameValidationRules.update.map(rule => rule.run(req)));
    const validationError = validate(req, res, () => {});
    if (validationError && validationError.statusCode === 400) {
      return;
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Trim text fields if provided
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    
    const game = await Game.findByIdAndUpdate(
      id, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    );
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        errorCode: 'GAME_NOT_FOUND'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Game updated successfully', 
      data: game 
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => ({
        field: val.path,
        message: val.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errorCode: 'DUPLICATE_KEY'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

// @desc   Delete a game
// @route  DELETE /api/games/:id
// @access Private/Admin
const deleteGame = async (req, res) => {
  try {
    // Validate ID format
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID'
      });
    }

    const game = await Game.findByIdAndDelete(id);
    
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        errorCode: 'GAME_NOT_FOUND'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Game deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR'
    });
  }
};

export { addGame, getAllGames, getGameById, updateGame, deleteGame };