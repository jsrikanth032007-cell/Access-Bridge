import { updateProfileSchema } from '../validators/profileValidator.js';
import { ProfileService } from '../services/storeService.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.findByUserId(userId);

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const validatedData = updateProfileSchema.parse(req.body);

    const updatedProfile = await ProfileService.updateByUserId(userId, validatedData);

    res.json({
      success: true,
      message: 'Accessibility profile updated successfully.',
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

