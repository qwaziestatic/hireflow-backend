// src/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Jobseeker
 *               email:
 *                 type: string
 *                 format: email
 *                 example: alice@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [jobseeker, employer]
 *                 default: jobseeker
 *                 example: jobseeker
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       422:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name too long"),
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("role").optional().isIn(["jobseeker", "employer"]).withMessage("Role must be jobseeker or employer"),
  ],
  validate,
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: bob@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Redirect to Google OAuth consent screen
 *     tags: [Auth]
 *     description: Redirects the browser to Google's sign-in page. Not testable directly in Swagger — visit the URL in a browser.
 *     responses:
 *       302:
 *         description: Redirect to Google consent screen
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth2 callback handler
 *     tags: [Auth]
 *     description: Google redirects here after user approves. Returns a JWT and redirects to the frontend.
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token in URL query string
 */

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
      session: false,
    }),
    googleCallback
  );
} else {
  router.get("/google", (req, res) => {
    res.status(503).json({ success: false, message: "Google OAuth is not configured on this server." });
  });
  router.get("/google/callback", (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=google_not_configured`);
  });
}

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized — missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me", authenticate, getMe);

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alice Updated
 *               bio:
 *                 type: string
 *                 example: Full-stack developer with 4 years experience
 *               location:
 *                 type: string
 *                 example: Addis Ababa, Ethiopia
 *               resume_url:
 *                 type: string
 *                 example: https://drive.google.com/my-resume
 *               avatar:
 *                 type: string
 *                 example: https://imgur.com/my-photo.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
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