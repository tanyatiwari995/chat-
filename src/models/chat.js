import mongoose from 'mongoose';
import auth from "../middleware/auth.js";
const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  emoji: String,
}, { _id: false });

const chatSchema = new mongoose.Schema({
  text: { type: String, required: false },
  fileUrl: { type: String },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: String },
  reactions: [reactionSchema],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  edited: { type: Boolean, default: false },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

//Rename model to "Chat" instead of "Message"
const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
