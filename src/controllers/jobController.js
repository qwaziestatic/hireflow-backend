// src/controllers/jobController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles all job-related operations:
//   - GET    /api/jobs          → List/search/filter all jobs
//   - GET    /api/jobs/:id      → Get single job details
//   - POST   /api/jobs          → Create a new job (employer only)
//   - PUT    /api/jobs/:id      → Update a job (owner employer only)
//   - DELETE /api/jobs/:id      → Delete a job (owner or admin)
//   - GET    /api/jobs/my-jobs  → Get employer's own job listings
// ─────────────────────────────────────────────────────────────────────────────

const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// ── GET ALL JOBS (with search + filters + pagination) ─────────────────────────
// GET /api/jobs?search=react&category=Engineering&type=full-time&location=Remote&page=1&limit=10
const getAllJobs = async (req, res, next) => {
  try {
    // Destructure query params with default values
    const {
      search = "",       // Search text for title or description
      category = "",     // Job category filter
      type = "",         // Job type: full-time, part-time, etc.
      location = "",     // Location filter
      page = 1,          // Current page (for pagination)
      limit = 10,        // Jobs per page
      sort = "newest",   // Sort order: 'newest' | 'oldest'
    } = req.query;

    // Build the query dynamically using an array of conditions and params
    const conditions = ["j.status = 'active'"]; // Always filter to active jobs
    const params = [];
    let paramIndex = 1; // $1, $2, $3... (PostgreSQL uses $n placeholders)

    // Add search filter if provided
    // ILIKE = case-insensitive LIKE; % = wildcard
    // We push the same value TWICE — once for title match, once for description match
    // Using separate $n indexes avoids any driver ambiguity with repeated placeholders
    if (search) {
      conditions.push(
        `(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex + 1})`
      );
      params.push(`%${search}%`, `%${search}%`); // Push twice — one per column
      paramIndex += 2;
    }

    // Add category filter
    if (category) {
      conditions.push(`j.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    // Add job type filter
    if (type) {
      conditions.push(`j.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    // Add location filter (partial match)
    if (location) {
      conditions.push(`j.location ILIKE $${paramIndex}`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Join all conditions with AND
    const whereClause = conditions.join(" AND ");

    // Sorting
    const orderBy = sort === "oldest" ? "j.created_at ASC" : "j.created_at DESC";

    // Pagination: OFFSET tells DB how many rows to skip
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Main query: join jobs with companies to get company name/logo
    const jobsQuery = `
      SELECT
        j.id, j.title, j.type, j.location, j.salary_min, j.salary_max,
        j.experience, j.category, j.tags, j.deadline, j.views, j.created_at,
        c.id AS company_id, c.name AS company_name, c.logo_url AS company_logo,
        c.industry AS company_industry
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(parseInt(limit), offset);

    // Count query: same filters, no pagination — to calculate total pages
    const countQuery = `
      SELECT COUNT(*) FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Remove the LIMIT and OFFSET params

    // Run both queries simultaneously for efficiency
    const [jobsResult, countResult] = await Promise.all([
      pool.query(jobsQuery, params),
      pool.query(countQuery, countParams),
    ]);

    const total = parseInt(countResult.rows[0].count); // Total matching jobs
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      jobs: jobsResult.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET SINGLE JOB ────────────────────────────────────────────────────────────
// GET /api/jobs/:id
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params; // Job ID from URL

    // Increment view counter atomically (no race conditions)
    await pool.query("UPDATE jobs SET views = views + 1 WHERE id = $1", [id]);

    // Fetch full job details with company info
    const result = await pool.query(
      `SELECT
         j.*,
         c.id AS company_id, c.name AS company_name, c.logo_url,
         c.website, c.industry, c.size, c.description AS company_description,
         c.location AS company_location,
         u.name AS posted_by_name
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       JOIN users u ON j.posted_by = u.id
       WHERE j.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Job not found");
    }

    res.json({ success: true, job: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── CREATE JOB ────────────────────────────────────────────────────────────────
// POST /api/jobs
// Only employers can do this (middleware enforces it)
const createJob = async (req, res, next) => {
  try {
    const {
      company_id, title, description, requirements,
      type, location, salary_min, salary_max,
      experience, category, tags, deadline,
    } = req.body;

    // Make sure this company belongs to the logged-in employer
    const companyCheck = await pool.query(
      "SELECT id FROM companies WHERE id = $1 AND owner_id = $2",
      [company_id, req.user.id]
    );

    if (companyCheck.rows.length === 0) {
      throw createError(403, "You don't own this company");
    }

    const result = await pool.query(
      `INSERT INTO jobs
         (id, company_id, posted_by, title, description, requirements, type,
          location, salary_min, salary_max, experience, category, tags, deadline)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        uuidv4(), company_id, req.user.id, title, description, requirements,
        type, location, salary_min, salary_max, experience, category,
        tags || [], // Default to empty array if no tags
        deadline || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE JOB ────────────────────────────────────────────────────────────────
// PUT /api/jobs/:id
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only the employer who posted it can update it
    const jobCheck = await pool.query(
      "SELECT * FROM jobs WHERE id = $1 AND posted_by = $2",
      [id, req.user.id]
    );

    if (jobCheck.rows.length === 0) {
      throw createError(404, "Job not found or you don't have permission");
    }

    const {
      title, description, requirements, type, location,
      salary_min, salary_max, experience, category, tags, deadline, status,
    } = req.body;

    const result = await pool.query(
      `UPDATE jobs SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         requirements = COALESCE($3, requirements),
         type = COALESCE($4, type),
         location = COALESCE($5, location),
         salary_min = COALESCE($6, salary_min),
         salary_max = COALESCE($7, salary_max),
         experience = COALESCE($8, experience),
         category = COALESCE($9, category),
         tags = COALESCE($10, tags),
         deadline = COALESCE($11, deadline),
         status = COALESCE($12, status),
         updated_at = NOW()
       WHERE id = $13
       RETURNING *`,
      [title, description, requirements, type, location, salary_min,
       salary_max, experience, category, tags, deadline, status, id]
    );

    res.json({ success: true, message: "Job updated", job: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── DELETE JOB ────────────────────────────────────────────────────────────────
// DELETE /api/jobs/:id
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only the job owner or an admin can delete
    const query = req.user.role === "admin"
      ? "DELETE FROM jobs WHERE id = $1 RETURNING id"
      : "DELETE FROM jobs WHERE id = $1 AND posted_by = $2 RETURNING id";

    const params = req.user.role === "admin"
      ? [id]
      : [id, req.user.id];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw createError(404, "Job not found or access denied");
    }

    res.json({ success: true, message: "Job deleted" });
  } catch (err) {
    next(err);
  }
};

// ── GET MY JOBS (Employer) ────────────────────────────────────────────────────
// GET /api/jobs/my-jobs
const getMyJobs = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT j.*, c.name AS company_name,
         (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS application_count
       FROM jobs j
       JOIN companies c ON j.company_id = c.id
       WHERE j.posted_by = $1
       ORDER BY j.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
