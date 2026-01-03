require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Path resolution for static files
const _dirname = path.resolve();
// We'll use __dirname where possible for CommonJS safety

// Updated deployment - including user location routes

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://athithya-pi.vercel.app",
  "https://athithya.in",
  "https://www.athithya.in",
  "https://api.athithya.in",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".athithya.in")) {
      callback(null, true);
    } else {
      console.log("CORS origin not in whitelist:", origin);
      callback(null, true); // Allow for now to debug
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200 // Some older browsers prefer 200
};

// Middleware
app.use(cors(corsOptions));
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
app.use("/api/notifications", require("./routes/notifications"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Serve frontend static files
app.use(express.static(path.join(_dirname, "At-front", "dist")));

// API 404 (catches all unmatched /api routes)
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// SPA fallback for all other routes - MUST be last
app.get("*", (req, res) => {
  const indexPath = path.resolve(_dirname, "At-front", "dist", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("SPA Fallback Error:", err);
      res.status(404).json({
        message: "Frontend not found or route invalid",
        path: indexPath
      });
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error - " + (err?.message || "Unknown error"),
    error: process.env.NODE_ENV === 'development' ? (err?.stack || err) : {}
  });
});

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel
module.exports = app;
