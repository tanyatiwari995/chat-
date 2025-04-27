import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Utility to generate JWT token
const generateToken = (user) => {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
};

// Utility to build session user object
const buildSessionUser = (user) => ({
  id: user._id,
  username: user.username,
  name: user.name,
  profilePicture: user.profilePicture,
  gender: user.gender,
});

// Signup - Register new user
export const signup = async (req, res) => {
 
  const { username, name, password, profilePicture = "https://example.com/default-avatar.png", gender } = req.body;
  console.log( req.body);
  
  if (!username || !name || !password) {
    return res.status(400).json({ message: "Required fields missing" });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, name, password: hashedPassword, profilePicture, gender });

    const sessionUser = buildSessionUser(user);
    req.session.user = sessionUser;
    const token = generateToken(sessionUser);

    res.status(201).json({ message: "Signup successful", user: sessionUser, token });
  } catch (err) {
    console.error("Signup Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Signin - Login existing user
export const signin = async (req, res) => {
 
  
  const { username, password } = req.body;
  console.log( req.body);
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch)
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const sessionUser = buildSessionUser(user);
    console.log(sessionUser)
    req.session.user = sessionUser;
    const token = generateToken(sessionUser);
  console.log(token);

    res.json({ message: "Login successful", user: sessionUser, token });
  } catch (err) {
    console.error("Signin Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout - Handle user logout
export const logout = (req, res) => {
 
  
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout Error:", err);
      return res.status(500).json({ message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
};

// Signout - Alias for logout if needed
export const signout = logout;
console.log(signout)
// Secure route - Protected route that checks for authenticated user
export const secure = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  res.json({ message: "You are authenticated!", user: req.session.user });
};