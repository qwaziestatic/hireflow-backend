// src/middleware/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// These are middleware functions that sit BETWEEN the route and the controller.
// They run before the controller to check if the user is allowed to proceed.
// ─────────────────────────────────────────────────────────────────────────────

const passport = require("passport");

// ── authenticate ──────────────────────────────────────────────────────────────
// Use this middleware on any route that requires a logged-in user.
// It validates the JWT token in the Authorization header.
// If valid → sets req.user → calls next() to proceed to controller
// If invalid → returns 401 Unauthorized
const authenticate = (req, res, next) => {
  // passport.authenticate('jwt', ...) runs our JwtStrategy from passport.js
  // { session: false } means we don't use sessions for API routes (stateless JWT)
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      // Unexpected server error
      return res.status(500).json({ success: false, message: "Auth error" });
    }

    if (!user) {
      // Token missing, expired, or invalid
      return res.status(401).json({
        success: false,
        message: info?.message || "Access denied. Please log in.",
      });
    }

    // Token is valid — attach user object to request, continue to controller
    req.user = user;
    next();
  })(req, res, next);
};

// ── authorizeRoles ────────────────────────────────────────────────────────────
// Use this AFTER authenticate to restrict a route to specific roles.
// Example: authorizeRoles('employer', 'admin') allows only employers and admins
// Usage in route: router.post('/jobs', authenticate, authorizeRoles('employer'), createJob)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // req.user was set by the authenticate middleware above
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is for: ${roles.join(", ")}`,
      });
    }
    next(); // Role is allowed — proceed to controller
  };
};

// ── optionalAuth ──────────────────────────────────────────────────────────────
// Like authenticate but doesn't block the request if there's no token.
// Useful for routes where logged-in users see more data (e.g., saved job status)
// but the route is also accessible to guests.
const optionalAuth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (user) req.user = user; // Attach user if token exists and is valid
    next(); // Always continue, even without a token
  })(req, res, next);
};

module.exports = { authenticate, authorizeRoles, optionalAuth };
