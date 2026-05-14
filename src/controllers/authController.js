// src/controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles all authentication logic:
//   - POST /api/auth/register  → Create new account
//   - POST /api/auth/login     → Login with email/password
//   - GET  /api/auth/google    → Redirect to Google OAuth
//   - GET  /api/auth/google/callback → Handle Google OAuth return
//   - GET  /api/auth/me        → Get current logged-in user
// ─────────────────────────────────────────────────────────────────────────────

const bcrypt = require("bcryptjs");   // For hashing passwords securely
const jwt = require("jsonwebtoken");  // For creating/signing JWT tokens
const { v4: uuidv4 } = require("uuid"); // For generating unique IDs
const pool = require("../config/db"); // Database connection pool
const { createError } = require("../middleware/errorHandler");

// ── generateToken ─────────────────────────────────────────────────────────────
// Helper: creates a signed JWT containing the user's id, email, and role.
// The token expires in 7 days (set in .env as JWT_EXPIRES_IN).
const generateToken = (user) => {
  return jwt.sign(
    // PAYLOAD: data stored inside the token (readable by anyone — don't store secrets)
    { id: user.id, email: user.email, role: user.role },

    // SECRET: key used to sign the token (only the server knows this)
    process.env.JWT_SECRET,

    // OPTIONS: when it expires
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ── REGISTER ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, role }   (role = 'jobseeker' | 'employer')
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = "jobseeker" } = req.body;

    // Check if a user with this email already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      // 409 Conflict — the email is taken
      throw createError(409, "Email is already registered");
    }

    // Hash the password using bcrypt with 12 salt rounds.
    // Salt rounds = how many times the hashing algorithm is applied.
    // More rounds = slower to crack but also slower to compute.
    // 12 is a good balance for production.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert the new user into the database
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, avatar, created_at`,
      [uuidv4(), name, email, hashedPassword, role]
    );

    const user = result.rows[0]; // The newly created user

    // Create a JWT token for them so they're logged in immediately after registering
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,   // Send token to frontend — they store it in localStorage
      user,    // Send user data so frontend can populate the UI right away
    });
  } catch (err) {
    next(err); // Pass error to the centralized errorHandler middleware
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email — also get the password hash for comparison
    const result = await pool.query(
      "SELECT id, name, email, password, role, avatar FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // Don't say "email not found" — that leaks info about who's registered
      throw createError(401, "Invalid email or password");
    }

    const user = result.rows[0];

    // Google OAuth users have no password — they can't log in with password
    if (!user.password) {
      throw createError(401, "This account uses Google login. Please use Google sign-in.");
    }

    // Compare the submitted password against the stored hash
    // bcrypt.compare handles the hash comparison securely
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw createError(401, "Invalid email or password");
    }

    // Passwords match — generate a token
    const token = generateToken(user);

    // Don't send the password hash back to the client!
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    next(err);
  }
};

// ── GOOGLE OAUTH CALLBACK ─────────────────────────────────────────────────────
// GET /api/auth/google/callback
// Passport already ran GoogleStrategy and attached user to req.user.
// We just need to generate a JWT and redirect the user to the frontend.
const googleCallback = (req, res) => {
  const token = generateToken(req.user); // req.user was set by Passport

  // Redirect to frontend with the token in the URL query string.
  // The React app reads this token from the URL and stores it.
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  res.redirect(`${frontendURL}/auth/callback?token=${token}`);
};

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
// GET /api/auth/me
// Protected route — requires valid JWT in Authorization header.
// The authenticate middleware sets req.user before this runs.
const getMe = async (req, res, next) => {
  try {
    // Fetch fresh user data from DB (in case profile was updated)
    const result = await pool.query(
      `SELECT id, name, email, role, avatar, bio, location, resume_url, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "User not found");
    }

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE PROFILE ────────────────────────────────────────────────────────────
// PUT /api/auth/profile
// Body: { name, bio, location, resume_url, avatar }
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, location, resume_url, avatar } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           location = COALESCE($3, location),
           resume_url = COALESCE($4, resume_url),
           avatar = COALESCE($5, avatar),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, role, avatar, bio, location, resume_url`,
      [name, bio, location, resume_url, avatar, req.user.id]
    );

    // COALESCE means: use the new value IF provided, otherwise keep the old value
    // This way, fields not included in the request body won't be wiped out

    res.json({
      success: true,
      message: "Profile updated",
      user: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleCallback, getMe, updateProfile };
