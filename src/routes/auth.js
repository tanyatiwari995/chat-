import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware: Supports both JWT and session-based auth
const auth = (req, res, next) => {
  console.log(auth);
  
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// POST /login (or create if not found)
router.post("/login", async (req, res) => {
  const { username, password, profilePicture } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
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

      const sessionUser = {
        id: user._id,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        gender: user.gender,
      };

      const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });
      return res.status(201).json({
        message: "User created with default password",
        user: sessionUser,
        token,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const sessionUser = {
      id: user._id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    req.session.user = sessionUser;
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", user: sessionUser, token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /signup
router.post("/signup", async (req, res) => {
  const { username, name, password, profilePicture = "https://example.com/default-avatar.png", gender } = req.body;
  if (!username || !name || !password) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, name, password: hashedPassword, profilePicture, gender });

    const sessionUser = {
      id: user._id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    req.session.user = sessionUser;
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "Signup successful", user: sessionUser, token });
  } catch (error) {
    console.error("Signup Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /signin (alias of login)
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const sessionUser = {
      id: user._id,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    req.session.user = sessionUser;
    const token = jwt.sign(sessionUser, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({ message: "Signin successful", user: sessionUser, token });
  } catch (err) {
    console.error("Signin Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /secure (protected route)
router.get("/secure", auth, (req, res) => {
  res.json({ message: "You are authenticated!", user: req.user });
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

// GET /signout (alias of logout)
router.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Signout error:", err);
      return res.status(500).json({ message: "Error during signout" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Signed out successfully" });
  });
});

export default router;