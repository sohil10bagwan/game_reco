import Slider from '../models/sliderModel.js';
import mongoose from 'mongoose';

// @desc   Create a new slider
// @route  POST /api/sliders
// @access Private/Admin
const createSlider = async (req, res) => {
  try {
    
      
    const sliderData = {
      ...req.body,
      addedBy: req.user._id,
      title: req.body.title?.trim(),
      description: req.body.description ? req.body.description.trim() : undefined,
    };

    // Normalize possible image URL field names from the client (case-insensitive)
    const imageFieldNames = ['imageUrl', 'imageURL', 'image', 'coverImage', 'image_url', 'imageurl'];
    
    let finalImageUrl = null;
    // Check for direct matches first
    for (const fieldName of imageFieldNames) {
      if (req.body[fieldName] !== undefined && req.body[fieldName] !== null) {
        finalImageUrl = req.body[fieldName];
        break;
      }
    }

    // Fallback: look for any key that case-insensitively matches "imageurl" or "image_url"
    if (finalImageUrl === null || finalImageUrl === undefined) {
      const imageKey = Object.keys(req.body).find((key) => {
        const lower = key.toLowerCase();
        return lower === 'imageurl' || lower === 'image_url';
      });
      if (imageKey) {
        finalImageUrl = req.body[imageKey];
      }
    }

    // Explicitly handle image URL if provided (allow empty strings)
    if (finalImageUrl !== undefined && finalImageUrl !== null) {
      sliderData.imageUrl = String(finalImageUrl).trim();
    }

    const slider = await Slider.create(sliderData);

    res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: slider,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => ({
        field: val.path,
        message: val.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errorCode: 'DUPLICATE_KEY',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Get all sliders
// @route  GET /api/sliders
// @access Public
const getAllSliders = async (req, res) => {
  try {
    const allowedSortFields = ['createdAt', 'title', 'order', 'year'];
    const allowedOrders = ['asc', 'desc'];

    const { platform, type, search, sortBy = 'order', order = 'asc' } = req.query;

    if (sortBy && !allowedSortFields.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sortBy parameter',
        errorCode: 'INVALID_SORT_FIELD',
      });
    }

    if (order && !allowedOrders.includes(order)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be "asc" or "desc"',
        errorCode: 'INVALID_ORDER',
      });
    }

    if (search && search.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Search term too long',
        errorCode: 'SEARCH_TERM_TOO_LONG',
      });
    }

    const filter = {};

    if (platform) {
      const validPlatforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'];
      if (!validPlatforms.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid platform',
          errorCode: 'INVALID_PLATFORM',
        });
      }
      filter.platform = { $in: [platform] };
    }

    if (type) {
      const validTypes = ['P2P', 'Steam', 'Epic', 'Origin', 'GOG', 'Other'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type',
          errorCode: 'INVALID_TYPE',
        });
      }
      filter.type = type;
    }

    if (search) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;

    const sliders = await Slider.find(filter)
      .sort({ [sortBy]: sortOrder })
      .populate('addedBy', 'name');

    res.json({
      success: true,
      count: sliders.length,
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Get single slider by ID
// @route  GET /api/sliders/:id
// @access Public
const getSliderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID',
      });
    }

    const slider = await Slider.findById(id).populate('addedBy', 'name');

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
        errorCode: 'SLIDER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      data: slider,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Update a slider
// @route  PUT /api/sliders/:id
// @access Private/Admin
const updateSlider = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID',
      });
    }

    const updateData = { ...req.body };
    if (updateData.title) updateData.title = updateData.title.trim();
    if (updateData.description) updateData.description = updateData.description.trim();

    // Normalize and trim image URL on update as well
    const imageFieldNames = ['imageUrl', 'imageURL', 'image', 'coverImage', 'image_url', 'imageurl'];
    
    let finalImageUrl = null;
    // Check for direct matches first
    for (const fieldName of imageFieldNames) {
      if (updateData[fieldName] !== undefined && updateData[fieldName] !== null) {
        finalImageUrl = updateData[fieldName];
        break;
      }
    }

    // Fallback: look for any key that case-insensitively matches "imageurl" or "image_url"
    if (finalImageUrl === null || finalImageUrl === undefined) {
      const imageKey = Object.keys(updateData).find((key) => {
        const lower = key.toLowerCase();
        return lower === 'imageurl' || lower === 'image_url';
      });
      if (imageKey) {
        finalImageUrl = updateData[imageKey];
      }
    }

    // Explicitly handle image URL if provided (allow empty strings)
    if (finalImageUrl !== undefined && finalImageUrl !== null) {
      updateData.imageUrl = String(finalImageUrl).trim();
    }

    const slider = await Slider.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
        errorCode: 'SLIDER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'Slider updated successfully',
      data: slider,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(val => ({
        field: val.path,
        message: val.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        errorCode: 'DUPLICATE_KEY',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

// @desc   Delete a slider
// @route  DELETE /api/sliders/:id
// @access Private/Admin
const deleteSlider = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
        errorCode: 'INVALID_ID',
      });
    }

    const slider = await Slider.findByIdAndDelete(id);

    if (!slider) {
      return res.status(404).json({
        success: false,
        message: 'Slider not found',
        errorCode: 'SLIDER_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'Slider deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    });
  }
};

export { createSlider, getAllSliders, getSliderById, updateSlider, deleteSlider };