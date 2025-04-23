import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  unreadCount: {
    type: Map,
    of: Number,
    default: {},
  },
});

const Group = mongoose.model("Group", groupSchema);
export default Group;
