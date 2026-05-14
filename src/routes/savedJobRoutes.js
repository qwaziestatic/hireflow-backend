// src/routes/savedJobRoutes.js

const express = require("express");
const router = express.Router();

const { toggleSaveJob, getSavedJobs } = require("../controllers/savedJobController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

// GET  /api/saved-jobs        → Get all saved jobs (jobseeker)
router.get("/", authenticate, authorizeRoles("jobseeker"), getSavedJobs);

// POST /api/saved-jobs/:jobId → Toggle save/unsave (jobseeker)
router.post("/:jobId", authenticate, authorizeRoles("jobseeker"), toggleSaveJob);

module.exports = router;
