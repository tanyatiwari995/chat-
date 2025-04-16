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

// Import necessary GraphQL types and resolvers
import mergedTypeDef from "./typeDefs/index.js";
import mergedResolvers from "./resolvers/index.js";
import connectToMongoDB from "./db/mongo.db.js";
import { configurePassport } from "./passport/passport.config.js";

// Load environment variables from .env file
dotenv.config({ path: "./.env" });

// Configure Passport for user authentication
configurePassport();

const port = process.env.PORT || 4000;
const uri = process.env.MONGO_URI;
const secret = process.env.SESSION_SECRET;

// Initialize Express and HTTP server
const app = express();
const httpServer = http.createServer(app);

// MongoDB session store setup
const MongoDBStore = connectMongo(session);
const store = new MongoDBStore({
  uri: uri,
  collection: "sessions",
});

// Handle errors with the session store
store.on("error", (error) => console.log(error.message));

// Session setup for user authentication
app.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // Session expiration (7 days)
      httpOnly: true, // Protect against XSS attacks
    },
    store: store,
  })
);
// Initialize Passport.js middleware
app.use(passport.initialize());
app.use(passport.session());

// Use Helmet for security headers
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    credentials: true, // Allow cookies with cross-origin requests
    methods: ["GET", "POST", "OPTIONS"], // Restrict allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow only these headers
  })
);

// Middleware for parsing JSON bodies
app.use(express.json()); // This will set 'Content-Type: application/json' automatically

// Setup Apollo Server (GraphQL)
const server = new ApolloServer({
  typeDefs: mergedTypeDef,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// Middleware for handling GraphQL requests
app.use(
  "/graphql",
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => buildContext({ req, res }),
  })
);

// Connect to MongoDB and start the server
await connectToMongoDB(uri);

await new Promise((resolve) => httpServer.listen({ port: port }, resolve));

console.log(`🚀 Server ready at http://localhost:${port}`);

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  await httpServer.close();
  console.log("Server shut down gracefully");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});
