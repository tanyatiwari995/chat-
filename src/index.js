// index.js or server.js

import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import passport from "passport";
import dotenv from "dotenv";
import helmet from "helmet";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildContext } from "graphql-passport";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();
const port = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;
const secret = process.env.SESSION_SECRET;

// MongoDB session store setup
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri,
  collection: "sessions",
});
store.on("error", (error) => console.log("Session store error:", error.message));

// Express & HTTP server setup
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Socket handler
import socketHandler from "./socket.js";
socketHandler(io);

// Security and CORS middleware
app.use(helmet());
app.use(cors({
  credentials: true,
  origin: "*", // In production, set to your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
  store,
}));

// Passport config
import { configurePassport } from "./passport/passport.config.js";
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import typingRoutes from "./routes/typing.js";
import notificationRoutes from "./routes/notification.js";
import { router as groupRoutes } from "./routes/group.js";
import transactionRoutes from "./routes/transaction.route.js";

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/typing", typingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/transactions", transactionRoutes); // ✅ MOUNTED ONLY ONCE

// GraphQL setup
import mergedTypeDef from "./typeDefs/index.js";
import mergedResolvers from "./resolvers/index.js";

const server = new ApolloServer({
  typeDefs: mergedTypeDef,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use(
  "/graphql",
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// Connect to MongoDB
import connectToMongoDB from "./db/mongo.db.js";
await connectToMongoDB(uri);

// Error handler
app.use((err, req, res, next) => {
  console.error("Internal server error:", err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await httpServer.close();
  console.log("Server shut down gracefully");
});

// Start server
httpServer.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
