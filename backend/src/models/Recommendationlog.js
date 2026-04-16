import mongoose from 'mongoose';

const recommendationLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userSpecs: {
      ram: { type: Number, required: true },
      cpu: { type: Number, required: true },
      gpu: { type: Number, required: true },
      storage: { type: Number, required: true },
      imageUrl: { type: String},
    },
    recommendedGames: [
      {
        gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
        title: String,
        matchScore: Number,
      },
    ],
    totalMatches: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('RecommendationLog', recommendationLogSchema);