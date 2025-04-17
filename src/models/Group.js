
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: String,
  members: [String], // user IDs
});

module.exports = mongoose.model('Group', groupSchema);
