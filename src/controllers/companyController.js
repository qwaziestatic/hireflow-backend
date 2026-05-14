// src/controllers/companyController.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles company profile operations:
//   - POST /api/companies          → Create a company (employer only)
//   - GET  /api/companies          → List all companies
//   - GET  /api/companies/:id      → Get single company + its jobs
//   - PUT  /api/companies/:id      → Update company (owner only)
//   - DELETE /api/companies/:id    → Delete company (owner or admin)
//   - GET  /api/companies/mine     → Get the logged-in employer's company
// ─────────────────────────────────────────────────────────────────────────────

const pool = require("../config/db");
const { createError } = require("../middleware/errorHandler");
const { v4: uuidv4 } = require("uuid");

// ── CREATE COMPANY ────────────────────────────────────────────────────────────
// POST /api/companies
// Body: { name, logo_url, website, industry, size, description, location }
const createCompany = async (req, res, next) => {
  try {
    const { name, logo_url, website, industry, size, description, location } = req.body;

    // One employer should have only one company — check for duplicates
    const existing = await pool.query(
      "SELECT id FROM companies WHERE owner_id = $1",
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      throw createError(409, "You already have a company profile. Update it instead.");
    }

    const result = await pool.query(
      `INSERT INTO companies (id, owner_id, name, logo_url, website, industry, size, description, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [uuidv4(), req.user.id, name, logo_url, website, industry, size, description, location]
    );

    res.status(201).json({
      success: true,
      message: "Company created successfully",
      company: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

// ── GET ALL COMPANIES ─────────────────────────────────────────────────────────
// GET /api/companies?page=1&limit=12
const getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search = "" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    let whereClause = "";

    if (search) {
      whereClause = "WHERE c.name ILIKE $1 OR c.industry ILIKE $1";
      params.push(`%${search}%`);
    }

    const companiesQuery = `
      SELECT
        c.*,
        u.name AS owner_name,
        COUNT(j.id) AS job_count   -- How many active jobs each company has
      FROM companies c
      JOIN users u ON c.owner_id = u.id
      LEFT JOIN jobs j ON j.company_id = c.id AND j.status = 'active'
      ${whereClause}
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(parseInt(limit), offset);

    const countQuery = `SELECT COUNT(*) FROM companies c ${whereClause}`;
    const countParams = search ? [`%${search}%`] : [];

    const [companiesResult, countResult] = await Promise.all([
      pool.query(companiesQuery, params),
      pool.query(countQuery, countParams),
    ]);

    res.json({
      success: true,
      companies: companiesResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET SINGLE COMPANY ────────────────────────────────────────────────────────
// GET /api/companies/:id
const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get company details
    const companyResult = await pool.query(
      `SELECT c.*, u.name AS owner_name, u.email AS owner_email
       FROM companies c
       JOIN users u ON c.owner_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (companyResult.rows.length === 0) {
      throw createError(404, "Company not found");
    }

    // Get the company's active jobs alongside company info
    const jobsResult = await pool.query(
      `SELECT id, title, type, location, salary_min, salary_max,
              experience, category, created_at
       FROM jobs
       WHERE company_id = $1 AND status = 'active'
       ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      company: companyResult.rows[0],
      jobs: jobsResult.rows,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET MY COMPANY ────────────────────────────────────────────────────────────
// GET /api/companies/mine
const getMyCompany = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM companies WHERE owner_id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: true, company: null }); // No company yet — that's ok
    }

    res.json({ success: true, company: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE COMPANY ────────────────────────────────────────────────────────────
// PUT /api/companies/:id
const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logo_url, website, industry, size, description, location } = req.body;

    const result = await pool.query(
      `UPDATE companies
       SET name = COALESCE($1, name),
           logo_url = COALESCE($2, logo_url),
           website = COALESCE($3, website),
           industry = COALESCE($4, industry),
           size = COALESCE($5, size),
           description = COALESCE($6, description),
           location = COALESCE($7, location),
           updated_at = NOW()
       WHERE id = $8 AND owner_id = $9
       RETURNING *`,
      [name, logo_url, website, industry, size, description, location, id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw createError(404, "Company not found or access denied");
    }

    res.json({ success: true, message: "Company updated", company: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ── DELETE COMPANY ────────────────────────────────────────────────────────────
// DELETE /api/companies/:id
const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = req.user.role === "admin"
      ? "DELETE FROM companies WHERE id = $1 RETURNING id"
      : "DELETE FROM companies WHERE id = $1 AND owner_id = $2 RETURNING id";

    const params = req.user.role === "admin" ? [id] : [id, req.user.id];

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      throw createError(404, "Company not found or access denied");
    }

    res.json({ success: true, message: "Company deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  deleteCompany,
};
