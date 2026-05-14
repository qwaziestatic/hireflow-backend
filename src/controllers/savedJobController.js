// src/controllers/savedJobController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles job bookmarking (saved jobs):
//   - POST   /api/saved-jobs/:jobId  → Save/unsave a job (toggle)
//   - GET    /api/saved-jobs         → Get all saved jobs for the user
// ─────────────────────────────────────────────────────────────────────────────

const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// ── TOGGLE SAVE JOB ───────────────────────────────────────────────────────────
// POST /api/saved-jobs/:jobId
// If already saved → remove it. If not saved → save it.
const toggleSaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // Check if this job is already saved
    const existing = await pool.query(
      "SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2",
      [userId, jobId]
    );

    if (existing.rows.length > 0) {
      // Already saved — remove it (unsave)
      await pool.query(
        "DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2",
        [userId, jobId]
      );
      return res.json({ success: true, saved: false, message: "Job removed from saved" });
    }

    // Not saved yet — check job exists first
    const jobExists = await pool.query("SELECT id FROM jobs WHERE id = $1", [jobId]);
    if (jobExists.rows.length === 0) {
      throw createError(404, "Job not found");
    }

    // Save the job
    await pool.query(
      "INSERT INTO saved_jobs (id, user_id, job_id) VALUES ($1, $2, $3)",
      [uuidv4(), userId, jobId]
    );

    res.json({ success: true, saved: true, message: "Job saved successfully" });
  } catch (err) {
    next(err);
  }
};

// ── GET SAVED JOBS ────────────────────────────────────────────────────────────
// GET /api/saved-jobs
const getSavedJobs = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         sj.id AS saved_id, sj.saved_at,
         j.id AS job_id, j.title, j.type, j.location,
         j.salary_min, j.salary_max, j.category, j.status,
         c.name AS company_name, c.logo_url AS company_logo
       FROM saved_jobs sj
       JOIN jobs j ON sj.job_id = j.id
       JOIN companies c ON j.company_id = c.id
       WHERE sj.user_id = $1
       ORDER BY sj.saved_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, savedJobs: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleSaveJob, getSavedJobs };
