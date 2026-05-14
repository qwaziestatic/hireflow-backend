-- src/config/schema.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this file ONCE on your NeonDB to create all tables.
-- In NeonDB dashboard: go to SQL Editor → paste this → Run
-- Or use: psql DATABASE_URL -f src/config/schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation extension
-- This lets PostgreSQL generate UUID primary keys automatically
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS TABLE ──────────────────────────────────────────────────────────────
-- Stores both job seekers and employers.
-- role = 'jobseeker' | 'employer' | 'admin'
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- Unique user ID
  name         VARCHAR(100) NOT NULL,                         -- Full name
  email        VARCHAR(150) UNIQUE NOT NULL,                  -- Must be unique
  password     VARCHAR(255),                                  -- NULL if OAuth user
  google_id    VARCHAR(100) UNIQUE,                           -- Google OAuth ID
  avatar       TEXT,                                          -- Profile picture URL
  role         VARCHAR(20) NOT NULL DEFAULT 'jobseeker',      -- User type
  bio          TEXT,                                          -- Short bio
  location     VARCHAR(100),                                  -- City/Country
  resume_url   TEXT,                                          -- Link to uploaded resume
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ── COMPANIES TABLE ───────────────────────────────────────────────────────────
-- An employer can create/manage a company profile.
CREATE TABLE IF NOT EXISTS companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The employer
  name         VARCHAR(150) NOT NULL,
  logo_url     TEXT,
  website      VARCHAR(255),
  industry     VARCHAR(100),
  size         VARCHAR(50),   -- e.g. "1-10", "11-50", "51-200", "200+"
  description  TEXT,
  location     VARCHAR(100),
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

-- ── JOBS TABLE ────────────────────────────────────────────────────────────────
-- Every job posting belongs to a company.
CREATE TABLE IF NOT EXISTS jobs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  posted_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Employer
  title          VARCHAR(200) NOT NULL,
  description    TEXT NOT NULL,
  requirements   TEXT,                  -- Skills / qualifications needed
  type           VARCHAR(50),           -- 'full-time', 'part-time', 'contract', 'internship'
  location       VARCHAR(100),          -- 'Remote', 'New York, NY', etc.
  salary_min     INTEGER,               -- Min salary in USD
  salary_max     INTEGER,               -- Max salary in USD
  experience     VARCHAR(50),           -- '0-1 years', '2-5 years', etc.
  category       VARCHAR(100),          -- 'Engineering', 'Design', 'Marketing', etc.
  tags           TEXT[],                -- Array of tags: ['React', 'Node.js']
  status         VARCHAR(20) DEFAULT 'active', -- 'active' | 'closed' | 'draft'
  deadline       DATE,                  -- Application deadline
  views          INTEGER DEFAULT 0,     -- How many times this job was viewed
  created_at     TIMESTAMP DEFAULT NOW(),
  updated_at     TIMESTAMP DEFAULT NOW()
);

-- ── APPLICATIONS TABLE ────────────────────────────────────────────────────────
-- Tracks every job application a jobseeker submits.
CREATE TABLE IF NOT EXISTS applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cover_letter TEXT,
  resume_url   TEXT,           -- They can upload a fresh resume per application
  status       VARCHAR(30) DEFAULT 'pending', -- 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  notes        TEXT,           -- Employer's private notes about this applicant
  applied_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),

  -- Prevent a user from applying to the same job twice
  UNIQUE(job_id, applicant_id)
);

-- ── SAVED JOBS TABLE ──────────────────────────────────────────────────────────
-- Bookmarks — a jobseeker can save jobs to apply later.
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id     UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  saved_at   TIMESTAMP DEFAULT NOW(),

  -- One save per job per user
  UNIQUE(user_id, job_id)
);

-- ── CONSTRAINTS ──────────────────────────────────────────────────────────────
-- Enforce valid role values at the database level
-- This is a second line of defence — the app also validates this
ALTER TABLE users
  ADD CONSTRAINT chk_user_role
  CHECK (role IN ('jobseeker', 'employer', 'admin'));

ALTER TABLE jobs
  ADD CONSTRAINT chk_job_status
  CHECK (status IN ('active', 'closed', 'draft'));

ALTER TABLE applications
  ADD CONSTRAINT chk_app_status
  CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired'));

-- ── AUTO updated_at TRIGGER ───────────────────────────────────────────────────
-- PostgreSQL does NOT auto-update updated_at like MySQL's ON UPDATE.
-- We need a trigger function to do it for us.
-- This fires BEFORE any UPDATE on the listed tables and sets updated_at = NOW().

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();  -- Set updated_at to current time on every update
  RETURN NEW;              -- Return the modified row to be written
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to each table that has an updated_at column
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── INDEXES ───────────────────────────────────────────────────────────────────
-- Indexes speed up queries on frequently filtered/sorted columns

CREATE INDEX IF NOT EXISTS idx_jobs_company       ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status        ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category      ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at    ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job   ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_user  ON applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user    ON saved_jobs(user_id);

-- ── SEED: SAMPLE CATEGORIES ───────────────────────────────────────────────────
-- (Optional) You can use these values in your frontend dropdowns
-- Engineering, Design, Marketing, Sales, Finance, HR, Product, DevOps, Data Science
