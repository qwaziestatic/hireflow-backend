// src/controllers/applicationController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles job applications:
//   - POST /api/applications          → Apply to a job (jobseeker)
//   - GET  /api/applications/my       → My applications (jobseeker)
//   - GET  /api/applications/job/:id  → Applications for a job (employer)
//   - PUT  /api/applications/:id/status → Update status (employer)
//   - DELETE /api/applications/:id    → Withdraw application (jobseeker)
// ─────────────────────────────────────────────────────────────────────────────

const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// ── APPLY TO A JOB ────────────────────────────────────────────────────────────
// POST /api/applications
// Body: { job_id, cover_letter, resume_url }
const applyToJob = async (req, res, next) => {
  try {
    const { job_id, cover_letter, resume_url } = req.body;
    const applicant_id = req.user.id; // Set by authenticate middleware

    // Check the job exists and is still active
    const jobCheck = await pool.query(
      "SELECT id, title FROM jobs WHERE id = $1 AND status = 'active'",
      [job_id]
    );

    if (jobCheck.rows.length === 0) {
      throw createError(404, "Job not found or no longer accepting applications");
    }

    // Check if already applied — the UNIQUE constraint in DB would also catch this,
    // but we check manually to give a cleaner error message
    const dupCheck = await pool.query(
      "SELECT id FROM applications WHERE job_id = $1 AND applicant_id = $2",
      [job_id, applicant_id]
    );

    if (dupCheck.rows.length > 0) {
      throw createError(409, "You have already applied to this job");
    }

    const result = await pool.query(
      `INSERT INTO applications (id, job_id, applicant_id, cover_letter, resume_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [uuidv4(), job_id, applicant_id, cover_letter, resume_url || req.user.resume_url]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── MY APPLICATIONS (Jobseeker view) ──────────────────────────────────────────
// GET /api/applications/my
const getMyApplications = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         a.id, a.status, a.cover_letter, a.applied_at,
         j.id AS job_id, j.title AS job_title, j.type, j.location,
         j.salary_min, j.salary_max,
         c.name AS company_name, c.logo_url AS company_logo
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE a.applicant_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, applications: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── APPLICATIONS FOR A JOB (Employer view) ───────────────────────────────────
// GET /api/applications/job/:jobId
const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Verify the employer owns this job before showing applications
    const jobCheck = await pool.query(
      "SELECT id FROM jobs WHERE id = $1 AND posted_by = $2",
      [jobId, req.user.id]
    );

    if (jobCheck.rows.length === 0) {
      throw createError(403, "Access denied or job not found");
    }

    const result = await pool.query(
      `SELECT
         a.id, a.status, a.cover_letter, a.resume_url, a.applied_at, a.notes,
         u.id AS applicant_id, u.name AS applicant_name,
         u.email AS applicant_email, u.avatar, u.bio, u.location
       FROM applications a
       JOIN users u ON a.applicant_id = u.id
       WHERE a.job_id = $1
       ORDER BY a.applied_at DESC`,
      [jobId]
    );

    res.json({ success: true, applications: result.rows });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE APPLICATION STATUS ─────────────────────────────────────────────────
// PUT /api/applications/:id/status
// Body: { status, notes }   (employer updates: reviewed, shortlisted, rejected, hired)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "hired"];
    if (!validStatuses.includes(status)) {
      throw createError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Only the employer who posted the job can update the application status
    const result = await pool.query(
      `UPDATE applications a
       SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
       FROM jobs j
       WHERE a.id = $3 AND a.job_id = j.id AND j.posted_by = $4
       RETURNING a.*`,
      [status, notes, id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Application not found or access denied");
    }

    res.json({ success: true, message: "Status updated", application: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── WITHDRAW APPLICATION ──────────────────────────────────────────────────────
// DELETE /api/applications/:id
const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM applications WHERE id = $1 AND applicant_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Application not found or access denied");
    }

    res.json({ success: true, message: "Application withdrawn" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
};
