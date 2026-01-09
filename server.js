require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Middleware & Configurations
const _dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://athithya-pi.vercel.app",
  "https://athithya.in",
  "https://www.athithya.in",
  "https://api.athithya.in",
  process.env.FRONTEND_URL,
].filter(Boolean).map(o => o.replace(/\/$/, ""));

// CORS Policy
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith(".athithya.in") ||
    origin.endsWith("athithya-pi.vercel.app");

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// Parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database
const { connectDB } = require("./db/mongoose");

// Ensure DB connection for API routes
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectDB();
    } catch (error) {
      console.error("DB Connection Middleware Error:", error);
    }
  }
  next();
});

// Routes
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const reviewRoutes = require("./routes/reviews");
const itineraryRoutes = require("./routes/itineraries");

app.use("/api/auth", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/itineraries", itineraryRoutes);
app.use("/api/notifications", require("./routes/notifications"));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Static Files & SPA Fallback
app.use(express.static(path.join(_dirname, "At-front", "dist")));

app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

app.get(/.*/, (req, res) => {
  const indexPath = path.resolve(_dirname, "At-front", "dist", "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("SPA Fallback Error:", err);
      if (!res.headersSent) {
        res.status(404).json({
          message: "Frontend not found or route invalid",
          path: indexPath,
        });
      }
    }
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error("UNHANDLED ERROR:", err);
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error - " + (err?.message || "Unknown error"),
      error: process.env.NODE_ENV === "development" ? err?.stack || err : {},
    });
  }
});

// Server Init
if (process.env.NODE_ENV !== "production") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app;
