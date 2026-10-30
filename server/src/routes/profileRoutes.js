import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;

