import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Authentication middleware
export default async function auth(req, res, next) {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is missing
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Authorization header missing' });
    }

    // Check if the token format is correct (Bearer <token>)
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Invalid token format, must start with Bearer' });
    }

    // Extract the token (remove "Bearer " part)
    const token = authHeader.split(' ')[1];

    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or token is invalid' });
    }

    // Attach the user document to the request object for later use
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Error:', err);

    // Specific handling for expired tokens
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Handle other errors (invalid token or general issues)
    res.status(401).json({ success: false, message: 'Unauthorized', error: err.message });
  }
}
