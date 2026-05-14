// src/middleware/errorHandler.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized error handling middleware.
// Express calls this automatically when next(err) is called anywhere in the app.
// It catches ALL unhandled errors and sends a clean JSON response.
// ─────────────────────────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Log the full error stack to the server console for debugging
  console.error("❌ Error:", err.stack || err.message);

  // Default to 500 Internal Server Error if no status code was set
  const statusCode = err.statusCode || err.status || 500;

  // Build the error response object
  const response = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // In development mode, also include the full stack trace
  // This helps you debug but should NEVER be sent to users in production
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// ── createError ───────────────────────────────────────────────────────────────
// Helper to create custom errors with HTTP status codes.
// Usage: throw createError(404, "Job not found")
// This gets caught by the errorHandler above.
const createError = (statusCode, message) => {
  const error = new Error(message);  // Standard JS Error with a message
  error.statusCode = statusCode;     // Attach HTTP status code to the error
  return error;
};

// ── validate ──────────────────────────────────────────────────────────────────
// Middleware to check express-validator results.
// Put this after your validation rules in routes to auto-reject bad input.
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req); // Check if any validation rules failed

  if (!errors.isEmpty()) {
    // Return 422 Unprocessable Entity with all validation error messages
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,    // Which field failed (e.g., "email")
        message: e.msg,   // The error message (e.g., "Invalid email")
      })),
    });
  }

  next(); // No validation errors — proceed to controller
};

module.exports = { errorHandler, createError, validate };
