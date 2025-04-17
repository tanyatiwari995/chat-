import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
  },
  receiver: {
    type: String, // Can be null if it's a group message
    default: null,
  },
  group: {
    type: String, // Can be null if it's a private chat
    default: null,
  },
  text: {
    type: String,
    required: true,
  },
  reactions: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      emoji: String,
    },
  ],
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  edited: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// module.exports = mongoose.model('Message', messageSchema);

export default mongoose.model("Message", messageSchema);