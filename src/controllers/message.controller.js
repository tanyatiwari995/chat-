import Message from '../models/Message.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const sendMessage = async (req, res) => {
  const { text, sender, receiver, group } = req.body;
  if (!text || !sender || !receiver) {
    return res.status(400).json({ error: "Text, sender, and receiver are required" });
  }

  try {
    const newMessage = new Message({ text, sender, receiver, group, createdAt: Date.now() });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMessages = async (req, res) => {
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
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reactToMessage = async (req, res) => {
  const { emoji, userId } = req.body;
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid message ID" });
  if (!emoji || !userId) return res.status(400).json({ error: "Emoji and userId are required" });

  try {
    await Message.findByIdAndUpdate(id, {
      $push: { reactions: { userId, emoji } },
    });
    res.status(200).json({ message: 'Reaction added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid message ID" });
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  try {
    await Message.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId },
    });
    res.status(200).json({ message: 'Message marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editMessage = async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid message ID" });
  if (!text) return res.status(400).json({ error: "Text is required" });

  try {
    await Message.findByIdAndUpdate(id, { text, edited: true });
    res.status(200).json({ message: 'Message updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) return res.status(400).json({ error: "Invalid message ID" });

  try {
    await Message.findByIdAndDelete(id);
    res.status(204).json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
