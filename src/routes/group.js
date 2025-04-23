import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  deleteGroupById,
  addMember,
  removeMember,
  renameGroup,
  assignAdmin,
  sendMessage,
  markMessageAsRead,
} from "../controllers/group.controller.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", (req, res) => res.send("Group Routes"));

router.post("/group", auth, createGroup);
router.get("/group", auth, getAllGroups);
router.get("/group/:id", auth, getGroupById);
router.delete("/group/:id", auth, deleteGroupById);

router.post("/group/:groupId/add-member", auth, addMember);
router.post("/group/:groupId/remove-member", auth, removeMember);
router.put("/group/:groupId/rename", auth, renameGroup);
router.post("/group/:groupId/assign-admin", auth, assignAdmin);

router.post("/group/:groupId/send-message", auth, sendMessage);
router.post("/group/:groupId/mark-read", auth, markMessageAsRead);

export default router;
