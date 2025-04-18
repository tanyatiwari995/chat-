import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js"; // You can use this in protected routes if needed

const router = express.Router();

// POST /login (Login or create user with profilePicture fallback)
router.post("/login", async (req, res) => {
  const { username, profilePicture } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    let user = await User.findOne({ username });

    if (!user) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      user = await User.create({
        username,
        name: "Anonymous",
        password: hashedPassword,
        profilePicture: profilePicture || "https://example.com/default-avatar.png",
        gender: "Other",
      });
    } else {
      const match = await bcrypt.compare("123456", user.password);
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    req.session.user = {
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    res.json(req.session.user);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /signup
router.post("/signup", async (req, res) => {
  const {
    username,
    name,
    password,
    profilePicture = "https://example.com/default-avatar.png",
    gender,
  } = req.body;

  if (!username || !name || !password) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      name,
      password: hashedPassword,
      profilePicture,
      gender,
    });

    req.session.user = {
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    res.status(201).json(req.session.user);
  } catch (error) {
    console.error("SignUp Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Logged out successfully" });
  });
});

// POST /signin
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = {
      id: user._id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    res.status(200).json({
      message: "Sign-in successful",
      user: req.session.user,
    });
  } catch (err) {
    console.error("Sign In Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /signout
router.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Signout error:", err);
      return res.status(500).json({ message: "Error during signout" });
    }
    res.clearCookie("connect.sid");
    return res.json({ message: "Signed out successfully" });
  });
});

export default router;
