import mongoose from 'mongoose';

const externalGameSourceSchema = new mongoose.Schema(
  {
    // Game title
    title: {
      type: String,
      required: true,
      trim: true,
    },
    
    // Source API information
    sourceApi: {
      type: String,
      required: true,
      enum: ['RAWG', 'IGDB', 'Steam'],
    },
    
    // External API game ID
    externalId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Unique compound index for source + external ID
    uniqueSourceKey: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    // Game description
    description: {
      type: String,
      maxlength: 5000,
    },
    
    // Release date
    releaseDate: {
      type: Date,
    },
    
    // System requirements (normalized)
    systemRequirements: {
      minimum: {
        ram: Number, // in GB
        cpu: String,
        gpu: String,
        storage: Number, // in GB
        os: String,
      },
      recommended: {
        ram: Number, // in GB
        cpu: String,
        gpu: String,
        storage: Number, // in GB
        os: String,
      },
    },
    
    // Parsed numeric requirements for easier querying
    parsedRequirements: {
      minRam: Number, // GB
      minCpu: Number, // GHz (estimated)
      minGpu: Number, // VRAM GB (estimated)
      minStorage: Number, // GB
    },
    
    // Media
    coverImage: {
      type: String,
    },
    screenshots: [{
      type: String,
    }],
    trailerUrl: String,
    
    // Metadata
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    metacriticScore: Number,
    
    genres: [{
      type: String,
    }],
    
    platforms: [{
      type: String,
      enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile', 'Mac', 'Linux'],
    }],
    
    publisher: String,
    developer: String,
    
    // Link to internal Game model if synced
    syncedGame: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
    },
    
    // Sync status
    isSynced: {
      type: Boolean,
      default: false,
    },
    
    lastSyncAt: Date,
    
    // Raw data from API (for debugging/reprocessing)
    rawData: {
      type: Object,
      default: {},
    },
    
    // Performance tier this game is suitable for
    performanceTier: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Ultra'],
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
externalGameSourceSchema.index({ sourceApi: 1, externalId: 1 });
externalGameSourceSchema.index({ syncedGame: 1 });
externalGameSourceSchema.index({ performanceTier: 1 });
externalGameSourceSchema.index({ releaseDate: -1 });

export default mongoose.model('ExternalGameSource', externalGameSourceSchema);
