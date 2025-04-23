import Typing from '../models/Typing.js';

export const updateTypingStatus = async (req, res) => {
  const { sender, receiver, isTyping } = req.body;
  try {
    const existing = await Typing.findOneAndUpdate(
      { sender, receiver },
      { isTyping, timestamp: new Date() },
      { upsert: true, new: true }
    );
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
