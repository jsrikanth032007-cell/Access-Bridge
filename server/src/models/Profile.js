import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    disabilityTypes: {
      type: [String],
      default: [],
    },
    preferredLanguage: {
      type: String,
      enum: ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'],
      default: 'English',
    },
    readingLevel: {
      type: String,
      enum: ['Simple', 'Very Simple', 'Original'],
      default: 'Simple',
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'xlarge'],
      default: 'medium',
    },
    dyslexiaFont: {
      type: Boolean,
      default: false,
    },
    highContrast: {
      type: Boolean,
      default: false,
    },
    reducedMotion: {
      type: Boolean,
      default: false,
    },
    autoReadAloud: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
export default Profile;

