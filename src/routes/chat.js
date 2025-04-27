// routes/chat.js

import express from "express";
import multer from "multer";
import path from "path";
import auth from "../middleware/auth.js";  // Importing the default export from auth.js

import {
  uploadFile,
  getChatHistory,
  reactOnChat,
  markChatRead,
  editChat,
  deleteChat,
  sendChat,
} from "../controllers/chat.controller.js";

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get("/:user1/:user2", getChatHistory);

router.post("/upload", upload.single("file"), uploadFile);

router.post("/react/:chatId", reactOnChat);

router.post("/read/:chatId", markChatRead);

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

router.put("/edit/:id", editChat);

router.delete("/:id", deleteChat);

router.post("/send", auth, sendChat);  // Using auth middleware to protect the send chat route

export default router;
