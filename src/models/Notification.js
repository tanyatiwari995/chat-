// models/Notification.js
import mongoose from 'mongoose';

// Define the notification schema
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // Field to track read/unread status
  createdAt: { type: Date, default: Date.now },
});

// Create and export the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;