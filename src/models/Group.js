import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
  res.send('Group Routes');
});

// Group schema definition
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: { type: [String], required: true }, // user IDs
});

// Export the mongoose model
const Group = mongoose.model('Group', groupSchema);

// Named export for router and model
export { router, Group };