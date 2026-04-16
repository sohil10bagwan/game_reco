import mongoose from 'mongoose';

const deviceSearchCacheSchema = new mongoose.Schema(
  {
    // Unique hash of the user's specs (e.g., "8gb-gtx1650-i5")
    specHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    
    // Normalized user specifications
    userSpecs: {
      ram: { type: Number, required: true },
      cpu: { type: Number, required: true },
      gpu: { type: Number, required: true },
      storage: { type: Number, required: true },
    },
    
    // Performance tier classification
    performanceTier: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Ultra'],
      required: true,
    },
    
    // Cached game results
    games: [
      {
        gameId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Game',
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        matchScore: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        imageUrl: String,
        rating: Number,
        genres: [String],
        platforms: [String],
      },
    ],
    
    // Cache metadata
    totalMatches: {
      type: Number,
      default: 0,
    },
    
    // External API sources used
    apiSources: [{
      type: String,
      enum: ['RAWG', 'IGDB', 'Steam', 'Manual'],
    }],
    
    // Cache expiration
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
    lastAiRefresh: {
      type: Date,
      default: null,
    },
    
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
deviceSearchCacheSchema.index({ specHash: 1, performanceTier: 1 });

export default mongoose.model('DeviceSearchCache', deviceSearchCacheSchema);
