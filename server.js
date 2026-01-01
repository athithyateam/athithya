require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const _dirname = path.resolve();

// Updated deployment - including user location routes

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://16.170.143.201:3000",
      "http://localhost:5000",
      "https://athithya-pi.vercel.app",
      process.env.FRONTEND_URL, // Add your production frontend URL to .env
    ].filter(Boolean); // Remove undefined values

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Still allow it for development, but log it
      console.log("CORS origin not in whitelist:", origin);
      callback(null, true); // Change to callback(new Error('Not allowed by CORS')) in production
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));

// Handle all OPTIONS requests for preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    return res.status(204).end();
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
require("./db/mongoose");

// Import routes
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const reviewRoutes = require("./routes/reviews");
const itineraryRoutes = require("./routes/itineraries");

// API routes
app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes); // Add users route for profile endpoint
app.use("/api/posts", postRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/itineraries", itineraryRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Serve frontend static files
app.use(express.static(path.join(_dirname, "At-front", "dist")));

// SPA fallback (REGEX ONLY)
app.get(/.*/, (_, res) => {
  res.sendFile(path.resolve(_dirname, "At-front", "dist", "index.html"));
});

// API 404 (optional but clean)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});

// Export for Vercel
module.exports = app;
