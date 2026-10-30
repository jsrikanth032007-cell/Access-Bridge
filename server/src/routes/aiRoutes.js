import { Router } from 'express';
import {
  simplify,
  describeImage,
  askVoiceAssistant,
  generateLectureNotes,
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// All AI routes require authentication and rate limiting
router.use(authenticate);
router.use(aiLimiter);

router.post('/simplify', upload.single('file'), simplify);
router.post('/describe-image', upload.single('image'), describeImage);
router.post('/ask', askVoiceAssistant);
router.post('/lecture-notes', upload.single('file'), generateLectureNotes);

export default router;
