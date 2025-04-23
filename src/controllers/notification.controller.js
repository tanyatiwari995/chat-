import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

// Get all notifications for a user
export const getNotificationsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId });
    res.status(200).json(notifications);
  } catch (err) {
    console.error(`Error in getNotificationsByUserId:`, err);
    res.status(500).json({ error: err.message });
  }
};

// Create a new notification
export const createNotification = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ error: 'userId and message are required' });
  }

  try {
    const notification = new Notification({ userId, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error('Error in createNotification:', err);
    res.status(500).json({ error: err.message });
  }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId) || notificationId.length !== 24) {
    return res.status(400).json({ error: 'Invalid notificationId format' });
  }

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error(`Error in markAsRead:`, err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

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
    console.error(`Error in deleteNotification:`, err);
    res.status(500).json({ error: err.message });
  }
};
