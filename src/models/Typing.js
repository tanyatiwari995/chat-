
import mongoose from 'mongoose';


const typingSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isTyping: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const Typing = mongoose.model('Typing', typingSchema);

// Export the model
export default Typing;
