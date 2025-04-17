// // import express from "express";
// // import http from "http";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import passport from "passport";
// // import session from "express-session";
// // import connectMongo from "connect-mongodb-session";
// // import { ApolloServer } from "@apollo/server";
// // import { expressMiddleware } from "@apollo/server/express4";
// // import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// // import { buildContext } from "graphql-passport";
// // import helmet from "helmet";

// // // Import necessary GraphQL types and resolvers
// // import mergedTypeDef from "./typeDefs/index.js";
// // import mergedResolvers from "./resolvers/index.js";
// // import connectToMongoDB from "./db/mongo.db.js";
// // import { configurePassport } from "./passport/passport.config.js";

// // // Load environment variables from .env file
// // dotenv.config({ path: "./.env" });

// // // Configure Passport for user authentication
// // configurePassport();

// // const port = process.env.PORT || 4000;
// // const uri = process.env.MONGO_URI;
// // const secret = process.env.SESSION_SECRET;

// // // Initialize Express and HTTP server
// // const app = express();
// // const httpServer = http.createServer(app);

// // // MongoDB session store setup
// // const MongoDBStore = connectMongo(session);
// // const store = new MongoDBStore({
// //   uri: uri,
// //   collection: "sessions",
// // });

// // // Handle errors with the session store
// // store.on("error", (error) => console.log(error.message));

// // // Session setup for user authentication
// // app.use(
// //   session({
// //     secret: secret,
// //     resave: false,
// //     saveUninitialized: false,
// //     cookie: {
// //       maxAge: 1000 * 60 * 60 * 24 * 7, // Session expiration (7 days)
// //       httpOnly: true, // Protect against XSS attacks
// //     },
// //     store: store,
// //   })
// // );
// // // Initialize Passport.js middleware
// // app.use(passport.initialize());
// // app.use(passport.session());

// // // Use Helmet for security headers
// // app.use(helmet());

// // // CORS Configuration
// // app.use(
// //   cors({
// //     credentials: true, // Allow cookies with cross-origin requests
// //     methods: ["GET", "POST", "OPTIONS"], // Restrict allowed methods
// //     allowedHeaders: ["Content-Type", "Authorization"], // Allow only these headers
// //   })
// // );

// // // Middleware for parsing JSON bodies
// // app.use(express.json()); // This will set 'Content-Type: application/json' automatically

// // // Setup Apollo Server (GraphQL)
// // const server = new ApolloServer({
// //   typeDefs: mergedTypeDef,
// //   resolvers: mergedResolvers,
// //   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// // });

// // await server.start();

// // // Middleware for handling GraphQL requests
// // app.use(
// //   "/graphql",
// //   express.json(),
// //   expressMiddleware(server, {
// //     context: async ({ req, res }) => buildContext({ req, res }),
// //   })
// // );

// // // Connect to MongoDB and start the server
// // await connectToMongoDB(uri);

// // await new Promise((resolve) => httpServer.listen({ port: port }, resolve));

// // console.log(`🚀 Server ready at http://localhost:${port}`);

// // // Graceful shutdown handling
// // process.on("SIGTERM", async () => {
// //   await httpServer.close();
// //   console.log("Server shut down gracefully");
// // });

// // // Error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error(err.stack);
// //   res.status(500).json({ message: "Something broke!" });
// // });
// // require('dotenv').config();
// // const express = require('express');
// // const http = require('http');
// // const cors = require('cors');
// // const mongoose = require('mongoose');
// // const socketHandler = require('./socket');

// // const app = express();
// // const server = http.createServer(app);
// // const io = require('socket.io')(server, {
// //   cors: { origin: '*' },
// // });

// // app.use(cors());
// // app.use(express.json());

// // // MongoDB Connection
// // mongoose.connect(process.env.MONGO_URI, {
// //   useNewUrlParser: true,
// //   useUnifiedTopology: true,
// // }).then(() => console.log("MongoDB Connected"))
// //   .catch(err => console.log(err));

// // // Routes
// // app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/chat', require('./routes/chat'));

// // // Socket Handler
// // socketHandler(io);

// // const PORT = process.env.PORT || 5000;
// // server.listen(PORT, () => console.log(`Server running on port ${PORT}`));





// // Import modules
// import express from "express";
// import http from "http";
// import cors from "cors";
// import dotenv from "dotenv";
// import passport from "passport";
// import session from "express-session";
// import connectMongo from "connect-mongodb-session";
// import { ApolloServer } from "@apollo/server";
// import { expressMiddleware } from "@apollo/server/express4";
// import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
// import { buildContext } from "graphql-passport";
// import helmet from "helmet";
// import mongoose from "mongoose";
// import { Server as SocketIOServer } from "socket.io";

// // Custom modules
// import mergedTypeDef from "./typeDefs/index.js";
// import mergedResolvers from "./resolvers/index.js";
// import connectToMongoDB from "./db/mongo.db.js";
// import { configurePassport } from "./passport/passport.config.js";
// import socketHandler from "./socket.js";
// import authRoutes from "./routes/auth.js";
// import chatRoutes from "./routes/chat.js";

// // Load .env config
// dotenv.config();
// const port = process.env.PORT || 4000;
// const uri = process.env.MONGO_URI;
// const secret = process.env.SESSION_SECRET;

// // MongoDB session store setup
// const MongoDBStore = connectMongo(session);
// const store = new MongoDBStore({
//   uri,
//   collection: "sessions",
// });
// store.on("error", (error) => console.log("Session store error:", error.message));

// // Express & HTTP server setup
// const app = express();
// const httpServer = http.createServer(app);

// // Socket.IO setup
// const io = new SocketIOServer(httpServer, {
//   cors: { origin: "*" },
// });
// socketHandler(io); // Attach your Socket.IO logic

// // Middleware
// app.use(
//   cors({
//     credentials: true,
//     origin: "*", // Adjust for frontend origin if needed
//     methods: ["GET", "POST", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// app.use(express.json());
// app.use(helmet());
// app.use(
//   session({
//     secret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
//     store,
//   })
// );
// app.use(passport.initialize());
// app.use(passport.session());

// // Configure Passport
// configurePassport();

// // REST routes
// app.use("/api/auth", authRoutes);
// app.use("/api/chat", chatRoutes);

// // Apollo GraphQL server
// const server = new ApolloServer({
//   typeDefs: mergedTypeDef,
//   resolvers: mergedResolvers,
//   plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
// });
// await server.start();
// app.use(
//   "/graphql",
//   express.json(),
//   expressMiddleware(server, {
//     context: async ({ req, res }) => buildContext({ req, res }),
//   })
// );

// // MongoDB and server start
// await connectToMongoDB(uri);
// await new Promise((resolve) => httpServer.listen({ port }, resolve));
// console.log(`🚀 Server ready at http://localhost:${port}`);

// // Graceful shutdown
// process.on("SIGTERM", async () => {
//   await httpServer.close();
//   console.log("Server shut down gracefully");
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error("Internal server error:", err.stack);
//   res.status(500).json({ message: "Something broke!" });
// });
// index.js
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
import mongoose from "mongoose";
import { Server as SocketIOServer } from "socket.io";

// Custom modules
import mergedTypeDef from "./typeDefs/index.js";
import mergedResolvers from "./resolvers/index.js";
import connectToMongoDB from "./db/mongo.db.js";
import { configurePassport } from "./passport/passport.config.js";
import socketHandler from "./socket.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
// import Message from "../models/Message.js";
// import Message from "./models/Message.js"; // ✅ if Message.js is in src/models/
// import Message from "./models/Message.js";
import Message from "./models/Message.js";
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
socketHandler(io); // Attach your Socket.IO logic

// Middleware
app.use(
  cors({
    credentials: true,
    origin: "*", // Adjust to your frontend origin if needed
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(helmet());
app.use(
  session({
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true },
    store,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Configure Passport
configurePassport();

// REST routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Apollo GraphQL server
const server = new ApolloServer({
  typeDefs: mergedTypeDef,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure this is inside an async function or top-level await
await server.start();
app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// MongoDB and server start
await connectToMongoDB(uri);
httpServer.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});

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
