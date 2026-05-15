// src/routes/jobRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  getAllJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs,
} = require("../controllers/jobController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

const jobValidation = [
  body("title").trim().notEmpty().withMessage("Job title is required").isLength({ max: 200 }),
  body("description").notEmpty().withMessage("Job description is required"),
  body("company_id").notEmpty().withMessage("Company ID is required"),
  body("type").optional().isIn(["full-time","part-time","contract","internship","freelance"]),
  body("salary_min").optional().isInt({ min: 0 }),
  body("salary_max").optional().isInt({ min: 0 }),
];

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all active jobs with search, filters, and pagination
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
 *         example: React
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         example: Engineering
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship, freelance]
 *         example: full-time
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         example: Remote
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *     responses:
 *       200:
 *         description: List of jobs with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/", getAllJobs);

/**
 * @swagger
 * /api/jobs/my-jobs:
 *   get:
 *     summary: Get all jobs posted by the logged-in employer
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Employer job listings with application counts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — employer role required
 */
router.get("/my-jobs", authenticate, authorizeRoles("employer"), getMyJobs);

/**
 * @swagger
 * /api/jobs/{id}:
 *   get:
 *     summary: Get single job details (also increments view count)
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: a0000001-0000-0000-0000-000000000001
 *     responses:
 *       200:
 *         description: Full job details with company info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 *       404:
 *         description: Job not found
 */
router.get("/:id", getJobById);

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Create a new job listing (employer only)
 *     tags: [Jobs]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, company_id]
 *             properties:
 *               company_id:
 *                 type: string
 *                 format: uuid
 *                 example: c1c2c3c4-0001-0001-0001-000000000001
 *               title:
 *                 type: string
 *                 example: Senior React Developer
 *               description:
 *                 type: string
 *                 example: We are looking for a Senior React Developer...
 *               requirements:
 *                 type: string
 *                 example: 3+ years React experience
 *               type:
 *                 type: string
 *                 enum: [full-time, part-time, contract, internship, freelance]
 *                 example: full-time
 *               location:
 *                 type: string
 *                 example: Remote
 *               salary_min:
 *                 type: integer
 *                 example: 90000
 *               salary_max:
 *                 type: integer
 *                 example: 130000
 *               experience:
 *                 type: string
 *                 example: 3-5 years
 *               category:
 *                 type: string
 *                 example: Engineering
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["React", "TypeScript"]
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2026-12-31"
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — employer role required
 */
router.post("/", authenticate, authorizeRoles("employer"), jobValidation, validate, createJob);

/**
 * @swagger
 * /api/jobs/{id}:
 *   put:
 *     summary: Update a job listing (owner employer only)
 *     tags: [Jobs]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, closed, draft]
 *     responses:
 *       200:
 *         description: Job updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found or access denied
 *   delete:
 *     summary: Delete a job listing
 *     tags: [Jobs]
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
 *         description: Job deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Job not found or access denied
 */
router.put("/:id", authenticate, authorizeRoles("employer"), validate, updateJob);
router.delete("/:id", authenticate, authorizeRoles("employer", "admin"), deleteJob);

module.exports = router;
