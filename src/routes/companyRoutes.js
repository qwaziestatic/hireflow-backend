// src/routes/companyRoutes.js

const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  getMyCompany,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

const { authenticate, authorizeRoles } = require("../middleware/auth");
const { validate } = require("../middleware/errorHandler");

const companyValidation = [
  body("name").trim().notEmpty().withMessage("Company name is required"),
  body("website").optional().isURL().withMessage("Website must be a valid URL"),
];

// Public
router.get("/", getAllCompanies);
router.get("/mine", authenticate, authorizeRoles("employer"), getMyCompany); // before /:id
router.get("/:id", getCompanyById);

// Employer only
router.post("/", authenticate, authorizeRoles("employer"), companyValidation, validate, createCompany);
router.put("/:id", authenticate, authorizeRoles("employer"), validate, updateCompany);
router.delete("/:id", authenticate, authorizeRoles("employer", "admin"), deleteCompany);

module.exports = router;
