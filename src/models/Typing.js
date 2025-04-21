// models/Typing.js
import mongoose from 'mongoose';

const typingSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  isTyping: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const Typing = mongoose.model('Typing', typingSchema);
export default Typing;