import express from 'express';
import {
  updateTypingStatus,
  getTypingHistory,
  getTypingHistoryPaginated,
  getTypingActivityReport,
  getUserTypingAnalytics,
  getTypingHeatmap,
} from '../controllers/typing.controller.js';

const router = express.Router();

// Route to update typing status (individual or group)
router.post('/updateTypingStatus', updateTypingStatus);

// Route to get typing history (non-paginated)
router.get('/typingHistory/:sender/:receiver', getTypingHistory);

// Route to get typing history (paginated)
router.get('/typingHistoryPaginated/:sender/:receiver', getTypingHistoryPaginated);

// Route to get typing activity report (count)
router.get('/typingActivityReport/:userId', getTypingActivityReport);

// Route to get user typing analytics (average typing duration)
router.get('/userTypingAnalytics/:userId', getUserTypingAnalytics);

// Route to get typing heatmap (per hour and day)
router.get('/typingHeatmap/:userId', getTypingHeatmap);

export default router;
