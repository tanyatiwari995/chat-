import jwt from "jsonwebtoken";

// General authentication middleware: supports session and JWT
const auth = (req, res, next) => {
  //  Session-based authentication
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  //  JWT-based authentication
  const authHeader = req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  //  If neither session nor JWT token is valid
  return res.status(401).json({ message: "Unauthorized" });
};

export default auth;
