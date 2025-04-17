// routes/typing.js
import express from 'express';
import Typing from '../models/Typing.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { sender, receiver, isTyping } = req.body;
  try {
    const existing = await Typing.findOneAndUpdate(
      { sender, receiver },
      { isTyping, timestamp: new Date() },
      { upsert: true, new: true }
    );
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
