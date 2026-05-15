// src/server.js
// ─────────────────────────────────────────────────────────────────────────────
// This is the entry point for the entire backend.
// It sets up Express, all middleware, all routes, and starts listening.
// Run this file with: node src/server.js  (or npm run dev for nodemon)
// ─────────────────────────────────────────────────────────────────────────────

require("dotenv").config(); // Load .env variables FIRST before anything else

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const passport = require("./config/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Import all route files
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const companyRoutes = require("./routes/companyRoutes");
const savedJobRoutes = require("./routes/savedJobRoutes");

const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// ── SECURITY MIDDLEWARE ───────────────────────────────────────────────────────

// helmet() adds many security headers in one call, e.g.:
// X-XSS-Protection, X-Content-Type-Options, Strict-Transport-Security, etc.
app.use(helmet());

// CORS: Allow requests from the frontend URL.
// Without this, browsers block API calls from a different domain.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Allow cookies/authorization headers to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiting: Limit each IP to 100 requests per 15 minutes.
// Prevents bots from hammering the API or brute-forcing passwords.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100,                  // Max 100 requests per window per IP
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again after 15 minutes.",
  },
  standardHeaders: true,  // Sends RateLimit headers in response
  legacyHeaders: false,
});
app.use("/api", limiter); // Apply rate limiting only to API routes

// ── GENERAL MIDDLEWARE ────────────────────────────────────────────────────────

// Parse incoming JSON request bodies (e.g., req.body from POST requests)
app.use(express.json({ limit: "10mb" })); // 10mb limit for JSON bodies

// Parse URL-encoded bodies (e.g., from HTML forms)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Morgan: log HTTP requests — "dev" format is color-coded and concise
// Example: GET /api/jobs 200 45ms
app.use(morgan("dev"));

// Express Session: required for Passport's OAuth redirect flow.
// The session briefly holds the user during the Google login redirect.
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,            // Don't save session if it wasn't modified
    saveUninitialized: false, // Don't create a session until something is stored
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,  // Cookie can't be accessed by JavaScript (XSS protection)
      maxAge: 10 * 60 * 1000, // Session expires in 10 minutes (only used during OAuth flow)
    },
  })
);

// Initialize Passport and restore any session data
app.use(passport.initialize());
app.use(passport.session()); // Required for OAuth redirect sessions

// ── SWAGGER UI ────────────────────────────────────────────────────────────────
// Interactive API documentation — available at /api-docs
// Helmet blocks inline scripts by default, so we disable CSP for this route only
app.use("/api-docs", (req, res, next) => {
  res.setHeader("Content-Security-Policy", "");
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "HireFlow API Docs",
  customCss: `
    .swagger-ui .topbar { background: #1a1a2e; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    .swagger-ui .info .title { color: #2E4FA3; }
  `,
  swaggerOptions: {
    persistAuthorization: true, // Token stays after page refresh
    displayRequestDuration: true,
    filter: true,
  },
}));

// Also expose the raw JSON spec at /api-docs.json
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// ── HEALTH CHECK ROUTE ────────────────────────────────────────────────────────
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Server health check
 *     tags: [Health]
 *     description: Returns server status. Used by Render.com to verify the service is alive.
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job Portal API is running
 *                 environment:
 *                   type: string
 *                   example: production
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API ROUTES ────────────────────────────────────────────────────────────────
// Mount each router at its base path.
// All routes inside authRoutes will be prefixed with /api/auth
// e.g.: router.post('/login') → becomes → POST /api/auth/login
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/saved-jobs", savedJobRoutes);

// ── 404 HANDLER ───────────────────────────────────────────────────────────────
// If no route matched, return a clean 404 JSON response.
// This must come AFTER all route definitions.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────────
// Must be the LAST middleware registered.
// Catches any error passed via next(err) anywhere in the app.
app.use(errorHandler);

// ── START SERVER ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔒 JWT Auth: enabled`);
  console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || "http://localhost:5173"}\n`);
});

module.exports = app; // Export for testing with Postman / Jest
