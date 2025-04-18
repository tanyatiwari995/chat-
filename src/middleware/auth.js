import passport from "passport";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

// =====================
// Passport Configuration
// =====================
export const configurePassport = () => {
  passport.serializeUser((user, done) => {
    console.log("Serializing user");
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user");
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          return done(new Error("Invalid username or password"));
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(new Error("Invalid username or password"));
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};

// =====================
// Unified Auth Middleware
// =====================
const auth = (req, res, next) => {
  // 1. Check for session-based user
  if (req.session?.user) {
    req.user = req.session.user;
    return next();
  }

  // 2. Check for Bearer Token (JWT)
  const authHeader = req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  }

  // 3. Fallback to Passport session authentication
  passport.authenticate("session", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export default auth;
