// src/routes/savedJobRoutes.js

const express = require("express");
const router = express.Router();

const { toggleSaveJob, getSavedJobs } = require("../controllers/savedJobController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

/**
 * @swagger
 * /api/saved-jobs:
 *   get:
 *     summary: Get all bookmarked jobs (jobseeker only)
 *     tags: [Saved Jobs]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved jobs with company info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 savedJobs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       saved_id:
 *                         type: string
 *                         format: uuid
 *                       job_id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       company_name:
 *                         type: string
 *                       location:
 *                         type: string
 *                       salary_min:
 *                         type: integer
 *                       salary_max:
 *                         type: integer
 *                       saved_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — jobseeker role required
 */
router.get("/", authenticate, authorizeRoles("jobseeker"), getSavedJobs);

/**
 * @swagger
 * /api/saved-jobs/{jobId}:
 *   post:
 *     summary: Toggle save/unsave a job (jobseeker only)
 *     tags: [Saved Jobs]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID to toggle bookmark
 *         example: a0000001-0000-0000-0000-000000000001
 *     responses:
 *       200:
 *         description: Job saved or unsaved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 saved:
 *                   type: boolean
 *                   description: true if just saved, false if just unsaved
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Job saved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — jobseeker role required
 *       404:
 *         description: Job not found
 */
router.post("/:jobId", authenticate, authorizeRoles("jobseeker"), toggleSaveJob);

module.exports = router;
