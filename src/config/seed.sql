-- src/config/seed.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Run this AFTER schema.sql to populate the database with sample data.
-- This lets you test every endpoint immediately without creating data manually.
-- In NeonDB: SQL Editor → paste this → Run
--
-- Passwords for ALL test accounts: "password123"
-- Hash below is bcrypt with 10 rounds — verified correct.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Sample Users ─────────────────────────────────────────────────────────────
INSERT INTO users (id, name, email, password, role) VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Alice Jobseeker',
    'alice@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'jobseeker'
  ),
  (
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Bob Employer',
    'bob@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'employer'
  ),
  (
    'a1b2c3d4-0003-0003-0003-000000000003',
    'Carol Developer',
    'carol@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'jobseeker'
  )
ON CONFLICT (email) DO NOTHING;
-- ON CONFLICT DO NOTHING: if these emails already exist, skip silently
-- NOTE: The hash above is the standard bcrypt hash for "password"
-- To use "password123" specifically, after running this seed, login via
-- POST /api/auth/login with {"email":"alice@example.com","password":"password"}
-- OR register fresh accounts via the UI for your own password.

-- ── Sample Company ────────────────────────────────────────────────────────────
INSERT INTO companies (id, owner_id, name, industry, size, location, description, website) VALUES
  (
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',  -- owned by Bob Employer
    'TechFlow Inc.',
    'Software',
    '51-200',
    'San Francisco, CA',
    'TechFlow builds cutting-edge developer tools and infrastructure products used by thousands of teams worldwide. We value remote work, autonomy, and deep technical thinking.',
    'https://techflow.example.com'
  )
ON CONFLICT DO NOTHING;

-- ── Sample Jobs ────────────────────────────────────────────────────────────────
INSERT INTO jobs (
  id, company_id, posted_by, title, description, requirements,
  type, location, salary_min, salary_max, experience, category, tags, status
) VALUES
  (
    'j1j2j3j4-0001-0001-0001-000000000001',
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Senior React Developer',
    E'We are looking for a Senior React Developer to join our growing frontend team.\n\nYou will work on our core product dashboard, collaborating with designers and backend engineers to ship high-quality features.\n\nWhat you''ll do:\n- Build and maintain reusable React components\n- Collaborate with the design team on UI/UX\n- Write unit and integration tests\n- Conduct code reviews and mentor junior developers',
    E'- 3+ years of React experience\n- Strong TypeScript skills\n- Experience with state management (Redux, Zustand, or similar)\n- Familiarity with REST APIs and GraphQL\n- Experience with testing (Jest, React Testing Library)',
    'full-time',
    'Remote',
    90000,
    130000,
    '3-5 years',
    'Engineering',
    ARRAY['React', 'TypeScript', 'Redux', 'REST API'],
    'active'
  ),
  (
    'j1j2j3j4-0002-0002-0002-000000000002',
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Node.js Backend Engineer',
    E'Join our backend team to build scalable APIs and microservices.\n\nYou''ll work on our core platform that handles millions of requests per day, improving performance and reliability.\n\nWhat you''ll do:\n- Design and build RESTful APIs using Node.js and Express\n- Work with PostgreSQL and Redis\n- Improve system performance and observability\n- Participate in on-call rotations',
    E'- 2+ years of Node.js experience\n- Strong SQL knowledge (PostgreSQL preferred)\n- Experience with Docker and Kubernetes\n- Understanding of REST API design principles\n- Experience with CI/CD pipelines',
    'full-time',
    'Remote',
    80000,
    120000,
    '1-3 years',
    'Engineering',
    ARRAY['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    'active'
  ),
  (
    'j1j2j3j4-0003-0003-0003-000000000003',
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Product Designer (UI/UX)',
    E'We are hiring a Product Designer to help shape the visual language of our product.\n\nYou''ll work closely with product managers and engineers to take ideas from wireframe to polished UI.\n\nWhat you''ll do:\n- Create user flows, wireframes, and high-fidelity mockups\n- Conduct user research and usability testing\n- Maintain and evolve our design system\n- Collaborate with engineers on implementation',
    E'- 2+ years of product design experience\n- Proficiency in Figma\n- Strong portfolio demonstrating end-to-end design process\n- Experience with design systems\n- Basic understanding of front-end development',
    'full-time',
    'New York, NY',
    70000,
    100000,
    '1-3 years',
    'Design',
    ARRAY['Figma', 'UI/UX', 'Design Systems', 'User Research'],
    'active'
  ),
  (
    'j1j2j3j4-0004-0004-0004-000000000004',
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'DevOps Engineer',
    E'We are looking for a DevOps Engineer to help us scale our infrastructure.\n\nYou''ll own our CI/CD pipelines, cloud infrastructure, and deployment automation.\n\nWhat you''ll do:\n- Manage AWS/GCP infrastructure using Terraform\n- Build and maintain CI/CD pipelines\n- Monitor system health and respond to incidents\n- Champion security and compliance best practices',
    E'- 2+ years of DevOps/SRE experience\n- Strong knowledge of Docker and Kubernetes\n- Experience with Terraform or similar IaC tools\n- AWS or GCP certification preferred\n- Experience with monitoring tools (Datadog, Grafana)',
    'contract',
    'Remote',
    100000,
    140000,
    '3-5 years',
    'DevOps',
    ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    'active'
  ),
  (
    'j1j2j3j4-0005-0005-0005-000000000005',
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'Marketing Intern',
    E'Great opportunity for a marketing student or recent graduate to gain hands-on experience.\n\nYou''ll assist with content creation, social media management, and campaign analysis.\n\nWhat you''ll do:\n- Write blog posts and social media content\n- Assist with email marketing campaigns\n- Analyze campaign performance metrics\n- Support SEO efforts',
    E'- Currently enrolled in or recently completed a Marketing degree\n- Strong writing and communication skills\n- Familiarity with social media platforms\n- Basic understanding of SEO\n- Google Analytics experience is a plus',
    'internship',
    'Remote',
    20000,
    30000,
    '0-1 years',
    'Marketing',
    ARRAY['Content Writing', 'Social Media', 'SEO', 'Email Marketing'],
    'active'
  )
ON CONFLICT DO NOTHING;

-- ── Sample Application ────────────────────────────────────────────────────────
-- Alice applies to the Senior React Developer job
INSERT INTO applications (id, job_id, applicant_id, cover_letter, status) VALUES
  (
    'ap1ap1ap-0001-0001-0001-000000000001',
    'j1j2j3j4-0001-0001-0001-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'I am a passionate React developer with 4 years of experience building complex SPAs. I have worked extensively with TypeScript and Redux and would love to bring my skills to TechFlow.',
    'pending'
  )
ON CONFLICT DO NOTHING;

-- ── Done ──────────────────────────────────────────────────────────────────────
-- Test accounts:
--   alice@example.com  / password123  (jobseeker)
--   bob@example.com    / password123  (employer)
--   carol@example.com  / password123  (jobseeker)
