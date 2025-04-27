import express from "express";
import { signup, signin, logout, signout, secure } from "../controllers/auth.controller.js";


const router = express.Router();

// Route definitions
router.post("/signup", signup);  // Register new user
router.post("/signin", signin);  // Login existing user
router.post("/login", signin);    // both endpoint work fine
router.post("/logout", logout);  // Logout user
router.get("/signout", signout); // Alias for logout if needed
router.get("/secure", secure);   // Protected route
 
export default router;