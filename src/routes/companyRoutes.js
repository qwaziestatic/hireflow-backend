// src/routes/companyRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createCompany, getAllCompanies, getCompanyById,
  getMyCompany, updateCompany, deleteCompany,
} = require("../controllers/companyController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

const companyValidation = [
  body("name").trim().notEmpty().withMessage("Company name is required"),
  body("website").optional().isURL().withMessage("Website must be a valid URL"),
];

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Get all companies with job counts
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by company name or industry
 *         example: Tech
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *     responses:
 *       200:
 *         description: List of companies with active job counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 companies:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Company'
 *                       - type: object
 *                         properties:
 *                           job_count:
 *                             type: integer
 *                             example: 5
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", getAllCompanies);

/**
 * @swagger
 * /api/companies/mine:
 *   get:
 *     summary: Get the logged-in employer's company
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Employer's company profile (or null if none created yet)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 company:
 *                   nullable: true
 *                   $ref: '#/components/schemas/Company'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — employer role required
 */
router.get("/mine", authenticate, authorizeRoles("employer"), getMyCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Get a company profile with its active job listings
 *     tags: [Companies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: c1c2c3c4-0001-0001-0001-000000000001
 *     responses:
 *       200:
 *         description: Company details and active jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *       404:
 *         description: Company not found
 */
router.get("/:id", getCompanyById);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Create a company profile (employer only — one per employer)
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: TechFlow Inc.
 *               industry:
 *                 type: string
 *                 example: Software
 *               size:
 *                 type: string
 *                 example: 51-200
 *               location:
 *                 type: string
 *                 example: San Francisco, CA
 *               description:
 *                 type: string
 *                 example: TechFlow builds cutting-edge developer tools.
 *               website:
 *                 type: string
 *                 example: https://techflow.example.com
 *               logo_url:
 *                 type: string
 *                 example: https://imgur.com/logo.png
 *     responses:
 *       201:
 *         description: Company created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — employer role required
 *       409:
 *         description: Employer already has a company
 */
router.post("/", authenticate, authorizeRoles("employer"), companyValidation, validate, createCompany);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Update company profile (owner only)
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Company updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found or access denied
 *   delete:
 *     summary: Delete a company (owner or admin)
 *     tags: [Companies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Company deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Company not found or access denied
 */
router.put("/:id", authenticate, authorizeRoles("employer"), validate, updateCompany);
router.delete("/:id", authenticate, authorizeRoles("employer", "admin"), deleteCompany);

module.exports = router;
