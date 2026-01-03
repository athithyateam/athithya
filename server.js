require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

// Path resolution for static files
const _dirname = path.resolve();

// Allowed Origins for CORS
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

// 1. MANUAL CORS & PREFLIGHT - MUST BE FIRST
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Robust origin check
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith(".athithya.in") ||
    origin.endsWith("athithya-pi.vercel.app");

  if (isAllowed && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    // If no origin, likely same-site or direct call - allow Credentials
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

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// 2. PARSING MIDDLEWARE
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 3. DATABASE CONNECTION
require("./db/mongoose");

// 4. ROUTES
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// 5. STATIC FILES
app.use(express.static(path.join(_dirname, "At-front", "dist")));

// 6. API 404
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// 7. SPA FALLBACK
app.get("(.*)", (req, res) => {
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

// 8. GLOBAL ERROR HANDLER
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

// 9. START SERVER
if (process.env.NODE_ENV !== "production") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
  });
}

// 10. EXPORT FOR VERCEL
module.exports = app;
