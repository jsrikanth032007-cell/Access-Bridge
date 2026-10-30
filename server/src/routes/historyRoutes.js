import { Router } from 'express';
import {
  getHistory,
  getHistoryItem,
  deleteHistoryItem,
} from '../controllers/historyController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getHistory);
router.get('/:id', getHistoryItem);
router.delete('/:id', deleteHistoryItem);

export default router;
