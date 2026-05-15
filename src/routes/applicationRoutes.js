// src/routes/applicationRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  applyToJob, getMyApplications, getJobApplications,
  updateApplicationStatus, withdrawApplication,
} = require("../controllers/applicationController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Apply to a job (jobseeker only)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [job_id]
 *             properties:
 *               job_id:
 *                 type: string
 *                 format: uuid
 *                 example: a0000001-0000-0000-0000-000000000001
 *               cover_letter:
 *                 type: string
 *                 example: I am a passionate developer with 4 years experience...
 *               resume_url:
 *                 type: string
 *                 example: https://drive.google.com/my-resume
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 application:
 *                   $ref: '#/components/schemas/Application'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — jobseeker role required
 *       404:
 *         description: Job not found or no longer active
 *       409:
 *         description: Already applied to this job
 */
router.post(
  "/",
  authenticate,
  authorizeRoles("jobseeker"),
  [
    body("job_id").notEmpty().withMessage("Job ID is required"),
    body("cover_letter").optional().isLength({ max: 2000 }),
  ],
  validate,
  applyToJob
);

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     summary: Get all my applications (jobseeker only)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of the logged-in jobseeker's applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 applications:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Application'
 *                       - type: object
 *                         properties:
 *                           job_title:
 *                             type: string
 *                           company_name:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — jobseeker role required
 */
router.get("/my", authenticate, authorizeRoles("jobseeker"), getMyApplications);

/**
 * @swagger
 * /api/applications/job/{jobId}:
 *   get:
 *     summary: Get all applicants for a specific job (employer only)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Job ID to get applicants for
 *         example: a0000001-0000-0000-0000-000000000001
 *     responses:
 *       200:
 *         description: List of applicants with profile info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 applications:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Application'
 *                       - type: object
 *                         properties:
 *                           applicant_name:
 *                             type: string
 *                           applicant_email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — employer role required or doesn't own this job
 */
router.get("/job/:jobId", authenticate, authorizeRoles("employer"), getJobApplications);

/**
 * @swagger
 * /api/applications/{id}/status:
 *   put:
 *     summary: Update application status (employer only)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, shortlisted, rejected, hired]
 *                 example: shortlisted
 *               notes:
 *                 type: string
 *                 example: Strong candidate — schedule interview
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Application not found or access denied
 */
router.put(
  "/:id/status",
  authenticate,
  authorizeRoles("employer"),
  [body("status").isIn(["pending","reviewed","shortlisted","rejected","hired"])],
  validate,
  updateApplicationStatus
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Withdraw an application (jobseeker only)
 *     tags: [Applications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application withdrawn
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found or access denied
 */
router.delete("/:id", authenticate, authorizeRoles("jobseeker"), withdrawApplication);

module.exports = router;
