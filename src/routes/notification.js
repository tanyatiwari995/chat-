import express from 'express';
import {
  getNotificationsByUserId,
  createNotification,
  markAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/:userId', getNotificationsByUserId);
router.post('/', createNotification);
router.patch('/:notificationId/read', markAsRead);
router.delete('/:notificationId', deleteNotification);

export { router as notificationRoutes };
