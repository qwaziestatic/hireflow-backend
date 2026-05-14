// src/routes/authRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// Defines URL patterns for authentication endpoints.
// Routes connect URLs + HTTP methods → to controller functions.
// Validation rules are defined inline using express-validator.
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router(); // Creates a mini Express app for grouping routes
const { body } = require("express-validator"); // For validating request body fields
const passport = require("passport");

const {
  register,
  login,
  googleCallback,
  getMe,
  updateProfile,
} = require("../controllers/authController");

const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

// ── POST /api/auth/register ───────────────────────────────────────────────────
// Validation rules run BEFORE the controller.
// If any rule fails, validate() returns 422 with error details.
router.post(
  "/register",
  [
    body("name")
      .trim()                          // Remove leading/trailing spaces
      .notEmpty().withMessage("Name is required")
      .isLength({ max: 100 }).withMessage("Name too long"),

    body("email")
      .trim()
      .isEmail().withMessage("Valid email is required")
      .normalizeEmail(),               // Converts to lowercase, removes dots in Gmail

    body("password")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("role")
      .optional()
      .isIn(["jobseeker", "employer"]).withMessage("Role must be jobseeker or employer"),
  ],
  validate,   // Check results of above rules — returns 422 if any failed
  register    // Run the actual controller
);

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// ── GET /api/auth/google ───────────────────────────────────────────────────────
// Redirects user to Google's consent screen.
// 'scope' tells Google what info we want access to.
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // Request access to profile and email
    // NOTE: No session:false here — Passport needs the session during the
    // OAuth redirect. The state parameter stored in session prevents CSRF attacks.
  })
);

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
// Google redirects here after user approves.
// Passport runs GoogleStrategy, finds/creates user, sets req.user.
// Then our googleCallback controller fires and redirects to frontend with JWT.
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false,
  }),
  googleCallback
);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
// authenticate middleware verifies JWT, sets req.user, then getMe controller runs
router.get("/me", authenticate, getMe);

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
router.put(
  "/profile",
  authenticate,
  [
    body("name").optional().trim().isLength({ max: 100 }).withMessage("Name too long"),
    body("bio").optional().isLength({ max: 500 }).withMessage("Bio max 500 chars"),
  ],
  validate,
  updateProfile
);

module.exports = router;
