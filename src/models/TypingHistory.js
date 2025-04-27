// src/models/TypingHistory.js
import mongoose from 'mongoose';

// Define the TypingHistory schema for logging typing events
const TypingHistorySchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  isTyping: { type: Boolean, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create a model for TypingHistory (to store historical typing events)
const TypingHistoryModel = mongoose.model('TypingHistory', TypingHistorySchema);

export default TypingHistoryModel;
