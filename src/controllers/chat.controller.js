import { lookupService } from "dns/promises";
import Chat from "../models/chat.js";
// import Message from "../models/Message.js";
import path from "path";
import mongoose from "mongoose";

// Upload file response
export const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
};

// Get chat history
export const getChatHistory = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    console.log("hii");
    
    const messages = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reactOnChat= async (req, res) => {
  const { emoji, userId } = req.body;
  console.log("reactToMessage", req.body,req.params.chatId);

  try {
    const message = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        $push: { reactions: { userId, emoji } },
      },
      { new: true }
    );
    
    res.status(200).json({"succuss":"true"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark messages as read
export const markChatRead = async (req, res) => {
  const { userId } = req.body;
  try {
    await Chat.updateMany(
      { chatId: req.params.chatId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit a message
export const editChat = async (req, res) => {
  const { text } = req.body;
  try {
    await Chat.findByIdAndUpdate(req.params.id, {
      text,
      edited: true,
    });
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a message
export const 
deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message (requires auth)
export const sendChat = async (req, res) => {
  const { text, sender, receiver } = req.body;
  console.log("send", text);

  try {
    const data = await Chat.create({
      text,
      sender,
      receiver,
      createdAt: Date.now(),
    });

    res.status(201).json({ message: "Message sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
