import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

const router = express.Router();

// Route to get notifications by userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId });
    res.status(200).json(notifications);
  } catch (err) {
    console.error(`Error in GET /api/notifications/${userId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Route to create a new notification
router.post('/', async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error in POST /api/notifications:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route to mark a notification as read
router.patch('/:notificationId/read', async (req, res) => {
  const { notificationId } = req.params;

  // Validate notificationId format (24-character hexadecimal string)
  if (!mongoose.Types.ObjectId.isValid(notificationId) || notificationId.length !== 24) {
    return res.status(400).json({ error: 'Invalid notificationId format' });
  }

  try {
    const notification = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error(`Error in PATCH /api/notifications/${notificationId}/read:`, err);
    res.status(500).json({ error: err.message });
  }
});

// Route to delete a notification
router.delete('/:notificationId', async (req, res) => {
  const { notificationId } = req.params;

  // Validate notificationId format (24-character hexadecimal string)
  if (!mongoose.Types.ObjectId.isValid(notificationId) || notificationId.length !== 24) {
    return res.status(400).json({ error: 'Invalid notificationId format' });
  }

  try {
    const deleted = await Notification.findByIdAndDelete(notificationId);

    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(`Error in DELETE /api/notifications/${notificationId}:`, err);
    res.status(500).json({ error: err.message });
  }
});

export { router as notificationRoutes };