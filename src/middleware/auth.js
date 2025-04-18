import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  // Check for session-based authentication first
  if (req.session?.user) {
    req.user = req.session.user; // Attach the session user to the request object
    return next(); // Proceed to the next middleware or route handler
  }

  // Check for JWT-based authentication if no session exists
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode and verify the token
      req.user = decoded; // Attach the user from the decoded JWT token to the request object
      return next(); // Proceed to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  // If neither session nor token is found, return Unauthorized
  return res.status(401).json({ message: 'Unauthorized' });
};

export default auth;
