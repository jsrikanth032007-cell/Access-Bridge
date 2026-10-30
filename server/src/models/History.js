import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    featureType: {
      type: String,
      enum: ['simplify', 'describe-image', 'ask', 'lecture-notes'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    language: {
      type: String,
      default: 'English',
    },
    readingLevel: {
      type: String,
      default: 'Simple',
    },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.models.History || mongoose.model('History', historySchema);
export default History;
