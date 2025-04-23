import Group from "../models/Group.js";
import Message from "../models/Message.js";
import mongoose from "mongoose";

// CREATE GROUP
export const createGroup = async (req, res) => {
  const { name, members } = req.body;
  const userId = req.user._id;

  if (!name || !members || members.length < 1) {
    return res.status(400).json({ error: "Group name and members are required" });
  }

  try {
    const group = new Group({
      name,
      members: [...new Set([...members, userId])],
      admins: [userId],
      createdBy: userId,
    });

    await group.save();
    res.status(201).json({ message: "Group created successfully", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL GROUPS
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("members", "name email")
      .populate("admins", "name email");
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET GROUP BY ID
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE GROUP
export const deleteGroupById = async (req, res) => {
  try {
    const result = await Group.deleteOne({ _id: req.params.id });
    if (!result.deletedCount) return res.status(404).json({ message: "Group not found" });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};

// ADD MEMBER
export const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid group or user ID" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: "User already a member" });
    }

    group.members.push(userId);
    await group.save();
    res.status(200).json({ message: "User added to group", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// REMOVE MEMBER
export const removeMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.members = group.members.filter(id => id.toString() !== userId);
    await group.save();
    res.status(200).json({ message: "User removed", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// RENAME GROUP
export const renameGroup = async (req, res) => {
  const { groupId } = req.params;
  const { newName } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.name = newName;
    await group.save();
    res.status(200).json({ message: "Group renamed", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ASSIGN ADMIN
export const assignAdmin = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    if (!group.admins.includes(userId)) {
      group.admins.push(userId);
      await group.save();
    }

    res.status(200).json({ message: "Admin assigned", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  const { groupId } = req.params;
  const { text, sender } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    const message = new Message({ text, sender, group: groupId });
    await message.save();

    group.messages.push(message._id);
    for (let memberId of group.members) {
      if (memberId.toString() !== sender.toString()) {
        group.unreadCount.set(memberId.toString(), (group.unreadCount.get(memberId.toString()) || 0) + 1);
      }
    }
    await group.save();

    res.status(200).json({ message: "Message sent", data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK MESSAGE AS READ
export const markMessageAsRead = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: "Group not found" });

    group.unreadCount.set(userId.toString(), 0);
    await group.save();

    res.status(200).json({ message: "Unread count cleared", group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
