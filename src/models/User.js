// 

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensure no duplicate usernames
    trim: true,
  },
  socketId: {
    type: String,
    default: null, // Useful for detecting online/offline status
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

module.exports = mongoose.model('User', userSchema);
