// src/config/swagger.js
// ─────────────────────────────────────────────────────────────────────────────
// Swagger/OpenAPI 3.0 documentation configuration.
// This file defines the full API spec — every endpoint, request body,
// response schema, and security requirement.
//
// Access the docs at: http://localhost:5000/api-docs (development)
// or: https://hireflow-backend-66yt.onrender.com/api-docs (production)
// ─────────────────────────────────────────────────────────────────────────────

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HireFlow Job Portal API",
      version: "1.0.0",
      description: `
## HireFlow — Full-Stack Job Board API

A complete REST API for a Job Board and Career Portal built with **Node.js**, **Express**, and **PostgreSQL (NeonDB)**.

### Authentication
This API uses **JWT (JSON Web Token)** authentication. To access protected endpoints:
1. Register or login to get a token
2. Click the **Authorize** button above
3. Enter: \`Bearer YOUR_TOKEN_HERE\`
4. All protected requests will automatically include the token

### Roles
- **jobseeker** — Can browse jobs, apply, save jobs, manage profile
- **employer** — Can post jobs, manage company, review applicants
- **admin** — Can delete any job or company

### Live URLs
- **Frontend:** https://hireflow-frontend-five.vercel.app
- **Backend:** https://hireflow-backend-66yt.onrender.com

### Test Accounts
| Email | Password | Role |
|-------|----------|------|
| alice@example.com | password | jobseeker |
| bob@example.com | password | employer |
| carol@example.com | password | jobseeker |
| jane@example.com | password | employer |
| mark@example.com | password | employer |
      `,
      contact: {
        name: "Dagim Tsegaye",
        email: "dagimtsegaye014@gmail.com",
        url: "https://github.com/qwaziestatic",
      },
      license: {
        name: "MIT",
      },
    },
    servers: [
      {
        url: "https://hireflow-backend-66yt.onrender.com",
        description: "Production server (Render)",
      },
      {
        url: "http://localhost:5000",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token. Get one from POST /api/auth/login",
        },
      },
      schemas: {
        // ── USER ──────────────────────────────────────────────────────────
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", example: "a1b2c3d4-0001-0001-0001-000000000001" },
            name: { type: "string", example: "Alice Jobseeker" },
            email: { type: "string", format: "email", example: "alice@example.com" },
            role: { type: "string", enum: ["jobseeker", "employer", "admin"], example: "jobseeker" },
            avatar: { type: "string", nullable: true, example: "https://lh3.googleusercontent.com/..." },
            bio: { type: "string", nullable: true, example: "Full-stack developer with 3 years experience" },
            location: { type: "string", nullable: true, example: "Addis Ababa, Ethiopia" },
            resume_url: { type: "string", nullable: true, example: "https://drive.google.com/my-resume" },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── COMPANY ────────────────────────────────────────────────────────
        Company: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            owner_id: { type: "string", format: "uuid" },
            name: { type: "string", example: "TechFlow Inc." },
            logo_url: { type: "string", nullable: true },
            website: { type: "string", example: "https://techflow.example.com" },
            industry: { type: "string", example: "Software" },
            size: { type: "string", example: "51-200" },
            description: { type: "string", example: "TechFlow builds cutting-edge developer tools." },
            location: { type: "string", example: "San Francisco, CA" },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── JOB ────────────────────────────────────────────────────────────
        Job: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            company_id: { type: "string", format: "uuid" },
            posted_by: { type: "string", format: "uuid" },
            title: { type: "string", example: "Senior React Developer" },
            description: { type: "string", example: "We are looking for a Senior React Developer..." },
            requirements: { type: "string", nullable: true, example: "3+ years React experience..." },
            type: { type: "string", enum: ["full-time", "part-time", "contract", "internship", "freelance"], example: "full-time" },
            location: { type: "string", example: "Remote" },
            salary_min: { type: "integer", example: 90000 },
            salary_max: { type: "integer", example: 130000 },
            experience: { type: "string", example: "3-5 years" },
            category: { type: "string", example: "Engineering" },
            tags: { type: "array", items: { type: "string" }, example: ["React", "TypeScript", "Redux"] },
            status: { type: "string", enum: ["active", "closed", "draft"], example: "active" },
            deadline: { type: "string", format: "date", nullable: true },
            views: { type: "integer", example: 42 },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── APPLICATION ────────────────────────────────────────────────────
        Application: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            job_id: { type: "string", format: "uuid" },
            applicant_id: { type: "string", format: "uuid" },
            cover_letter: { type: "string", nullable: true, example: "I am a passionate developer..." },
            resume_url: { type: "string", nullable: true },
            status: { type: "string", enum: ["pending", "reviewed", "shortlisted", "rejected", "hired"], example: "pending" },
            notes: { type: "string", nullable: true, example: "Strong candidate — follow up" },
            applied_at: { type: "string", format: "date-time" },
          },
        },

        // ── ERROR ──────────────────────────────────────────────────────────
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
          },
        },

        // ── SUCCESS ────────────────────────────────────────────────────────
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
          },
        },

        // ── AUTH RESPONSE ──────────────────────────────────────────────────
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Logged in successfully" },
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: { $ref: "#/components/schemas/User" },
          },
        },

        // ── PAGINATION ─────────────────────────────────────────────────────
        Pagination: {
          type: "object",
          properties: {
            total: { type: "integer", example: 20 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 2 },
          },
        },
      },
    },
    tags: [
      { name: "Health", description: "Server health check" },
      { name: "Auth", description: "Authentication — register, login, Google OAuth, profile" },
      { name: "Jobs", description: "Job listings — browse, search, filter, CRUD" },
      { name: "Applications", description: "Job applications — apply, track, manage" },
      { name: "Companies", description: "Company profiles — create, view, manage" },
      { name: "Saved Jobs", description: "Bookmark jobs for later" },
    ],
  },
  // Scan these files for JSDoc @swagger comments
  apis: ["./src/routes/*.js", "./src/server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
