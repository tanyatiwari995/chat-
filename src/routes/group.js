import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Define the group schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: { type: [String], required: true }, // user IDs
});

// Create the Group model from the schema
const Group = mongoose.model("Group", groupSchema);
console.log(Group);

// Define your routes
router.get("/", (req, res) => {
  res.send("Group Routes");
});

// POST: Create a new group
router.post("/group", async (req, res) => {
  const { name, members } = req.body; // Get data from request body

  if (!name || !members) {
    return res
      .status(400)
      .json({ error: "Group name and members are required." });
  }

  try {
    const newGroup = new Group({ name, members });
    console.log(newGroup);
    
    await newGroup.save(); // Save the group to the database
    res.status(201).json(newGroup); // Return the created group
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get all groups
router.get("/group", async (req, res) => {
  try {
    const groups = await Group.find(); // Fetch all groups from the database
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get a single group by ID
router.get("/group/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id); // Find the group by ID
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    res.json(group); // Return the group details
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete a group by ID
router.delete("/group/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findByIdAndDelete(id); // Find and delete the group by ID
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }
    res.json({ message: "Group deleted successfully." }); // Confirmation message
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the router and the model
export { router, Group };
