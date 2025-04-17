import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import connectMongo from "connect-mongodb-session";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { buildContext } from "graphql-passport";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";

// Load .env config
dotenv.config();
const port = process.env.PORT || 4000;
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

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});
import socketHandler from "./socket.js";
socketHandler(io); // Attach your Socket.IO logic

// Middleware
app.use(
  cors({
    credentials: true,
    origin: "*", // Change to frontend origin in production
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json()); // ✅ This should come BEFORE route usage
app.use(helmet());
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
    },
    store,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
import { configurePassport } from "./passport/passport.config.js";
configurePassport();

// Import and setup routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import notificationRoutes from './routes/notification.js';
import typingRoutes from './routes/typing.js';
import messageRoutes from './routes/message.js';
import { router as groupRoutes } from './routes/group.js'; // Import only the router

// Use routes
app.use("/api/messages", messageRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/typing", typingRoutes); 
app.use("/api/groups", groupRoutes); // Add group routes here

// Apollo GraphQL server
import mergedTypeDef from "./typeDefs/index.js";
import mergedResolvers from "./resolvers/index.js";
const server = new ApolloServer({
  typeDefs: mergedTypeDef,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// GraphQL Middleware
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

// Graceful shutdown
process.on("SIGTERM", async () => {
  await httpServer.close();
  console.log("Server shut down gracefully");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Internal server error:", err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// Start server
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
