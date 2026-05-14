// src/routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");

const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

// ── POST /api/applications  → Apply to a job (jobseeker only) ────────────────
router.post(
  "/",
  authenticate,
  authorizeRoles("jobseeker"),
  [
    body("job_id").notEmpty().withMessage("Job ID is required"),
    body("cover_letter")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Cover letter max 2000 characters"),
  ],
  validate,
  applyToJob
);

// ── GET /api/applications/my  → My applications (jobseeker) ──────────────────
router.get("/my", authenticate, authorizeRoles("jobseeker"), getMyApplications);

// ── GET /api/applications/job/:jobId  → Applications for job (employer) ──────
router.get(
  "/job/:jobId",
  authenticate,
  authorizeRoles("employer"),
  getJobApplications
);

// ── PUT /api/applications/:id/status  → Update status (employer) ─────────────
router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("employer"),
  [
    body("status")
      .isIn(["pending", "reviewed", "shortlisted", "rejected", "hired"])
      .withMessage("Invalid status"),
  ],
  validate,
  updateApplicationStatus
);

// ── DELETE /api/applications/:id  → Withdraw (jobseeker) ─────────────────────
router.delete("/:id", authenticate, authorizeRoles("jobseeker"), withdrawApplication);

module.exports = router;
