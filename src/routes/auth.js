import express from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js"; // Import authentication middleware

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
      // Create a new user with default information (and hash the password)
      const hashedPassword = await bcrypt.hash("123456", 10); // Hash the default password

      user = await User.create({
        username,
        name: "Anonymous", // default name, can be changed
        password: hashedPassword, // hashed password
        profilePicture:
          profilePicture || "https://example.com/default-avatar.png",
        gender: "Other", // optional default
      });
    } else {
      // If the user exists, check the password (though it's not used in the default scenario)
      const match = await bcrypt.compare("123456", user.password); // Only for the default user case
      if (!match) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    }

    // Set session info for session-based authentication
    req.session.user = {
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    // Return the user info excluding sensitive data like password
    res.json(req.session.user);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /signup (Sign up a new user)
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
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password before saving it

    const user = await User.create({
      username,
      name,
      password: hashedPassword, // Store the hashed password
      profilePicture,
      gender,
    });

    // Set session info for session-based authentication
    req.session.user = {
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      gender: user.gender,
    };

    res.status(201).json(req.session.user); // Return the user info excluding password
  } catch (error) {
    console.error("SignUp Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
