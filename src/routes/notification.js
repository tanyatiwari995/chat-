// src/routes/notification.js
import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find({ userId });
    res.json(notifications);
  } catch (err) {
    
    res.status(500).json({ error: err.message });
  }
});

export default router;
