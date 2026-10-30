import { HistoryService } from '../services/storeService.js';

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const historyList = await HistoryService.findAllByUser(userId);

    res.json({
      success: true,
      count: historyList.length,
      history: historyList,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistoryItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const item = await HistoryService.findByIdAndUser(id, userId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or you do not have permission to view it.',
      });
    }

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHistoryItem = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    const deleted = await HistoryService.deleteByIdAndUser(id, userId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'History item not found or already removed.',
      });
    }

    res.json({
      success: true,
      message: 'Item removed from your history.',
    });
  } catch (error) {
    next(error);
  }
};
