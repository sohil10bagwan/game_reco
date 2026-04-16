import mongoose from 'mongoose';
import User from '../models/User.js';
import Game from '../models/Game.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateLibrary = async (userId) => {
  const user = await User.findById(userId)
    .populate('library.bookmarks')
    .populate('library.favorites');

  if (!user) {
    return null;
  }

  const library = user.library || { bookmarks: [], favorites: [] };

  return {
    bookmarks: library.bookmarks || [],
    favorites: library.favorites || [],
  };
};

// @desc   Get current user's library
// @route  GET /api/library/me
// @access Private
const getMyLibrary = async (req, res) => {
  try {
    const data = await populateLibrary(req.user._id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errorCode: 'USER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Add a game to bookmarks
// @route  POST /api/library/bookmarks/:gameId
// @access Private
const addBookmark = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format',
        errorCode: 'INVALID_ID',
      });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        errorCode: 'GAME_NOT_FOUND',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          'library.bookmarks': gameId,
        },
      },
      { new: true, upsert: false }
    );

    const data = await populateLibrary(req.user._id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Remove a game from bookmarks
// @route  DELETE /api/library/bookmarks/:gameId
// @access Private
const removeBookmark = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format',
        errorCode: 'INVALID_ID',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          'library.bookmarks': gameId,
        },
      },
      { new: true }
    );

    const data = await populateLibrary(req.user._id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Add a game to favorites
// @route  POST /api/library/favorites/:gameId
// @access Private
const addFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format',
        errorCode: 'INVALID_ID',
      });
    }

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found',
        errorCode: 'GAME_NOT_FOUND',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          'library.favorites': gameId,
        },
      },
      { new: true, upsert: false }
    );

    const data = await populateLibrary(req.user._id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Remove a game from favorites
// @route  DELETE /api/library/favorites/:gameId
// @access Private
const removeFavorite = async (req, res) => {
  try {
    const { gameId } = req.params;

    if (!isValidObjectId(gameId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid game ID format',
        errorCode: 'INVALID_ID',
      });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          'library.favorites': gameId,
        },
      },
      { new: true }
    );

    const data = await populateLibrary(req.user._id);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

export { getMyLibrary, addBookmark, removeBookmark, addFavorite, removeFavorite };

