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
 console.log(req.body)
  if (!text || !sender || !receiver) {
    return res.status(400).json({ error: "Text, sender, and receiver are required" });
  }

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
router.get('/:user1/:user2', auth, async (req, res) => {
  const { user1, user2 } = req.params;

  if (!isValidObjectId(user1) || !isValidObjectId(user2)) {
    return res.status(400).json({ error: "Invalid user IDs" });
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
        { group: { $in: [user1, user2] } },
      ],
    }).sort({ createdAt: 1 }); // Sort messages by date ascending

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// React to a message
router.post('/react/:id', auth, async (req, res) => {
  const { emoji, userId } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  if (!emoji || !userId) {
    return res.status(400).json({ error: "Emoji and userId are required for reactions" });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      $push: { reactions: { userId, emoji } },
    });
    res.status(200).json({ message: 'Reaction added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.post('/read/:id', auth, async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  if (!userId) {
    return res.status(400).json({ error: "User ID is required to mark the message as read" });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      $addToSet: { readBy: userId }, // Ensure only unique users mark as read
    });
    res.status(200).json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a message
router.put('/edit/:id', auth, async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  if (!text) {
    return res.status(400).json({ error: "Text is required to edit the message" });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndUpdate(objectId, {
      text,
      edited: true, // Mark message as edited
    });
    res.status(200).json({ message: 'Message updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a message
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId before proceeding
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid message ID" });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(id);

    await Message.findByIdAndDelete(objectId);
    res.status(204).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
