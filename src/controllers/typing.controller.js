import Typing from '../models/Typing.js';
import TypingHistory from '../models/TypingHistory.js';
import Group from '../models/Group.js';
import { getSocketInstance } from '../socket/socket.js'; // Import the socket instance

// Constants
const typingTimers = {}; 
const groupTypingTimers = {}; 
const DEFAULT_TYPING_TIMEOUT = 3000; // 3 seconds

// Helper: Get group members
const getGroupMembers = async (groupId) => {
  try {
    const group = await Group.findById(groupId).populate('members', '_id');
    if (!group) return [];
    return group.members.map((member) => member._id.toString());
  } catch (err) {
    console.error('Error fetching group members:', err);
    return [];
  }
};

// Helper: Update user's typing status
const updateUserTypingStatus = async (sender, receiver, isTyping) => {
  try {
    await Typing.findOneAndUpdate(
      { sender, receiver },
      { isTyping, timestamp: new Date() },
      { upsert: true, new: true }
    );

    const newHistory = new TypingHistory({
      sender,
      receiver,
      isTyping,
      timestamp: new Date(),
    });
    await newHistory.save();
  } catch (err) {
    console.error('Error updating typing status:', err);
  }
};

// Main: Update typing status (individual or group)
export const updateTypingStatus = async (req, res) => {
  const { sender, receiver, isTyping, groupChat = false, typingTimeout } = req.body;
  const timeoutDuration = typingTimeout || DEFAULT_TYPING_TIMEOUT;
  const io = getSocketInstance(); // Get the socket instance

  try {
    if (groupChat) {
      const groupMembers = await getGroupMembers(receiver);

      if (!groupMembers.length) {
        return res.status(404).json({ error: 'Group not found or no members in the group.' });
      }

      groupMembers.forEach((member) => {
        updateUserTypingStatus(sender, member, isTyping);
      });

      io.emit('groupTyping', { sender, groupId: receiver, isTyping });

      if (isTyping) {
        if (groupTypingTimers[receiver]) clearTimeout(groupTypingTimers[receiver]);
        groupTypingTimers[receiver] = setTimeout(async () => {
          groupMembers.forEach(async (member) => {
            await Typing.findOneAndUpdate(
              { sender, receiver: member },
              { isTyping: false },
              { new: true }
            );
          });
          io.emit('groupStopTyping', { sender, groupId: receiver });
        }, timeoutDuration);
      }

    } else {
      updateUserTypingStatus(sender, receiver, isTyping);

      if (isTyping) {
        io.emit('typing', { sender, receiver, isTyping });

        if (typingTimers[sender]) clearTimeout(typingTimers[sender]);
        typingTimers[sender] = setTimeout(async () => {
          await Typing.findOneAndUpdate(
            { sender, receiver },
            { isTyping: false },
            { new: true }
          );
          io.emit('stopTyping', { sender, receiver });
        }, timeoutDuration);

      } else {
        io.emit('stopTyping', { sender, receiver });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error updating typing status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get Typing History
export const getTypingHistory = async (req, res) => {
  const { sender, receiver } = req.params;

  try {
    const history = await TypingHistory.find({ sender, receiver }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Typing History (Paginated)
export const getTypingHistoryPaginated = async (req, res) => {
  const { sender, receiver } = req.params;
  const { limit = 10, page = 1 } = req.query;

  try {
    const history = await TypingHistory.find({ sender, receiver })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ timestamp: -1 });

    res.json({ history, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Typing Activity Report (count)
export const getTypingActivityReport = async (req, res) => {
  const { userId } = req.params;

  try {
    const activity = await TypingHistory.aggregate([
      { $match: { sender: userId } },
      { $group: { _id: "$sender", typingCount: { $sum: 1 } } }
    ]);

    res.json({ activity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// User Typing Analytics (Average Typing Duration)
export const getUserTypingAnalytics = async (req, res) => {
  const { userId } = req.params;
  try {
    const typingDurations = await TypingHistory.aggregate([
      { $match: { sender: userId, isTyping: true } },
      { $group: { _id: "$sender", avgTypingDuration: { $avg: "$timestamp" } } },
    ]);
    res.json({ typingDurations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Typing Activity Heatmap (per hour and day)
export const getTypingHeatmap = async (req, res) => {
  const { userId } = req.params;
  try {
    const heatmapData = await TypingHistory.aggregate([
      { $match: { sender: userId } },
      { $project: { hour: { $hour: "$timestamp" }, day: { $dayOfWeek: "$timestamp" } } },
      { $group: { _id: { day: "$day", hour: "$hour" }, count: { $sum: 1 } } },
      { $sort: { "_id.day": 1, "_id.hour": 1 } }
    ]);
    res.json({ heatmapData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rate Limiting Typing Status Updates
const typingStatusThrottle = (sender, receiver, isTyping) => {
  const lastUpdate = typingTimers[sender];
  const now = Date.now();
  if (!lastUpdate || now - lastUpdate >= 500) {
    typingTimers[sender] = now;
    updateUserTypingStatus(sender, receiver, isTyping);
  }
};

// Stop Typing After Timeout
const autoStopTyping = (sender, receiver, timeout) => {
  setTimeout(() => {
    io.emit('stopTyping', { sender, receiver });
  }, timeout);
};

// Enhanced Group Typing Timeout
const getGroupTypingTimeout = async (groupId) => {
  try {
    const group = await Group.findById(groupId);
    return group ? group.typingTimeout || DEFAULT_TYPING_TIMEOUT : DEFAULT_TYPING_TIMEOUT;
  } catch (err) {
    console.error('Error fetching group typing timeout:', err);
    return DEFAULT_TYPING_TIMEOUT;
  }
};
