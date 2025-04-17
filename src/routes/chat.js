
import express from 'express';
import multer from 'multer';
import path from 'path';

import Message from "./models/Message.js"
const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// 📩 Get chat history between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📁 Upload file (image, video, etc.)
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

// ❤️ React to a message
router.post('/react/:id', async (req, res) => {
  const { emoji, userId } = req.body;
  try {
    await Message.findByIdAndUpdate(req.params.id, {
      $push: { reactions: { userId, emoji } },
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👁️ Mark messages in a chat as read
router.post('/read/:chatId', async (req, res) => {
  const { userId } = req.body;
  try {
    await Message.updateMany(
      { chatId: req.params.chatId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Edit a message
router.put('/edit/:id', async (req, res) => {
  const { text } = req.body;
  try {
    await Message.findByIdAndUpdate(req.params.id, {
      text,
      edited: true,
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ Delete a message
router.delete('/:id', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
