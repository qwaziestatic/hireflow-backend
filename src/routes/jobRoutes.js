// src/routes/jobRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// All job-related routes.
// Public routes: anyone can browse/view jobs (no token required)
// Protected routes: need a valid JWT (authenticate middleware)
// Role-specific routes: need employer role (authorizeRoles middleware)
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require("../controllers/jobController");

const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

// Validation rules for creating/updating a job
const jobValidation = [
  body("title").trim().notEmpty().withMessage("Job title is required")
    .isLength({ max: 200 }).withMessage("Title too long"),
  body("description").notEmpty().withMessage("Job description is required"),
  body("company_id").notEmpty().withMessage("Company ID is required"),
  body("type")
    .optional()
    .isIn(["full-time", "part-time", "contract", "internship", "freelance"])
    .withMessage("Invalid job type"),
  body("salary_min").optional().isInt({ min: 0 }).withMessage("Salary must be a positive number"),
  body("salary_max").optional().isInt({ min: 0 }).withMessage("Salary must be a positive number"),
];

// ── PUBLIC ROUTES (no token needed) ──────────────────────────────────────────
router.get("/", getAllJobs);             // GET /api/jobs
router.get("/my-jobs", authenticate, authorizeRoles("employer"), getMyJobs); // must come BEFORE /:id
router.get("/:id", getJobById);         // GET /api/jobs/:id

// ── PROTECTED ROUTES (employer only) ─────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorizeRoles("employer"),           // Only employers can post jobs
  jobValidation,
  validate,
  createJob
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("employer"),
  validate,
  updateJob
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("employer", "admin"),  // Employers and admins can delete
  deleteJob
);

module.exports = router;
