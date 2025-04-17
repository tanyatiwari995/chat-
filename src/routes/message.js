import express from 'express';
import Message from '../models/Message.js';
import auth from '../middleware/auth.js'; // Assuming you have an authentication middleware
import mongoose from 'mongoose';  // Import mongoose to use Types.ObjectId

const router = express.Router();

// Function to validate ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new message
router.post('/send', auth, async (req, res) => {
  const { text, sender, receiver, group } = req.body;

  try {
    const newMessage = new Message({
      text,
      sender,
      receiver,
      group,
      createdAt: Date.now(),
    });

    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages between two users or in a group (private or group chat)
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
        { group: { $in: [user1, user2] } }, // Group chat condition (if required)
      ],
    }).sort({ createdAt: 1 }); // Sort messages by date ascending
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React to a message
router.post('/react/:id', async (req, res) => {
  const { emoji, userId } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      $push: { reactions: { userId, emoji } },
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.post('/read/:id', async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      $addToSet: { readBy: userId }, // Ensure only unique users mark as read
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a message
router.put('/edit/:id', async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      text,
      edited: true, // Mark message as edited
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndDelete(objectId);
    res.sendStatus(204); // No Content on successful deletion
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
