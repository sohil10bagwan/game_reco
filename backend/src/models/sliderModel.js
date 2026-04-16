import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    version: {
      type: String,
      trim: true,
    },
    platform: {
      type: [String],
      // enum: ['PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'],
      lowercase: true
    },
    type: {
      type: String,
      trim: true,
      // enum: ['P2P', 'Steam', 'Epic', 'Origin', 'GOG', 'Other'],
      lowercase: true
    },
    year: {
      type: Number,
      min: [1970, 'Year cannot be before 1970'],
      max: [2100, 'Year seems too far in the future'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '', // ensure field always exists on documents
      validate: {
        validator: function(v) {
          if (!v || v === '') return true; // Allow empty strings
          // Simple URL validation
          const urlPattern = /^https?:\/\/[\w\.-]+(?:\.[\w\.-]+)+[\w\-\.~:\/?#\[\]@!\$&'\(\)\*\+,;=.]+$/;
          return urlPattern.test(v);
        },
        message: props => `Invalid image URL format: ${props.value}`
      }
    },
    accent: {
      type: String,
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Accent must be a valid hex color (e.g. #fff or #4fc3f7)'],
      default: '#4fc3f7',
    },
    bg: {
      type: String,
      trim: true,
      default: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 40%, #2a3f5f 100%)',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      comment: 'Controls display order on the slider',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Slider', sliderSchema);