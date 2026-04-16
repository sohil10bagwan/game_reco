import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Game title is required'],
      trim: true,
      unique: true,
    },
    genre: {
      type: [String],
      required: [true, 'Genre is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
    },
    // Minimum Requirements
    minRam: {
      type: Number,
      required: [true, 'Minimum RAM is required'],
      comment: 'in GB',
    },
    minCpu: {
      type: Number,
      required: [true, 'Minimum CPU speed is required'],
      comment: 'in GHz',
    },
    minGpu: {
      type: Number,
      required: [true, 'Minimum GPU VRAM is required'],
      comment: 'in GB',
    },
    storage: {
      type: Number,
      required: [true, 'Storage requirement is required'],
      comment: 'in GB',
    },
    platform: {
      type: [String],
      required: [true, 'Platform is required'],
    },
    Years: {
      type: Number,
    },
    version: {
      type: String,
      required: [true, 'Version is required'],
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    
    // External API Integration Fields
    screenshots: [{
      type: String,
    }],
    
    // External API IDs for cross-referencing
    externalIds: {
      rawgId: String,
      igdbId: String,
      steamId: String,
    },
    
    // Source tracking
    sourceApi: {
      type: String,
      enum: ['RAWG', 'IGDB', 'Steam', 'Manual'],
      default: 'Manual',
    },
    
    // Performance tier this game is suitable for
    performanceTier: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Ultra'],
    },
    
    // Metacritic score if available
    metacriticScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Additional metadata
    trailerUrl: String,
    website: String,
    
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Optimizes recommendation chunk queries by hardware requirements + sorting
gameSchema.index({ minRam: 1, minCpu: 1, minGpu: 1, storage: 1, rating: -1, createdAt: -1 });

export default mongoose.model('Game', gameSchema);