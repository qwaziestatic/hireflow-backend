-- =============================================================================
-- COMPLETE SEED FILE — 20 Jobs across all categories
-- Run this in NeonDB SQL Editor
-- =============================================================================
 
-- ── USERS ─────────────────────────────────────────────────────────────────────
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
  ),
  (
    'a1b2c3d4-0004-0004-0004-000000000004',
    'Jane Smith',
    'jane@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'employer'
  ),
  (
    'a1b2c3d4-0005-0005-0005-000000000005',
    'Mark Johnson',
    'mark@example.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'employer'
  )
ON CONFLICT (email) DO NOTHING;
 
-- ── COMPANIES ─────────────────────────────────────────────────────────────────
INSERT INTO companies (id, owner_id, name, industry, size, location, description, website) VALUES
  (
    'c1c2c3c4-0001-0001-0001-000000000001',
    'a1b2c3d4-0002-0002-0002-000000000002',
    'TechFlow Inc.',
    'Software',
    '51-200',
    'San Francisco, CA',
    'TechFlow builds cutting-edge developer tools and infrastructure products used by thousands of teams worldwide. We value remote work, autonomy, and deep technical thinking.',
    'https://techflow.example.com'
  ),
  (
    'c1c2c3c4-0002-0002-0002-000000000002',
    'a1b2c3d4-0004-0004-0004-000000000004',
    'Designify Studio',
    'Design',
    '11-50',
    'New York, NY',
    'Designify is a creative studio specializing in brand identity, product design, and digital experiences for startups and Fortune 500 companies.',
    'https://designify.example.com'
  ),
  (
    'c1c2c3c4-0003-0003-0003-000000000003',
    'a1b2c3d4-0005-0005-0005-000000000005',
    'CloudScale Systems',
    'DevOps',
    '201-500',
    'Austin, TX',
    'CloudScale builds enterprise-grade cloud infrastructure and DevOps tooling. We help companies scale from startup to IPO with reliable, secure infrastructure.',
    'https://cloudscale.example.com'
  )
ON CONFLICT DO NOTHING;
 
-- ── 20 JOBS ───────────────────────────────────────────────────────────────────
 
-- JOB 1
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000001',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Senior React Developer',
  E'We are looking for a Senior React Developer to join our growing frontend team.\n\nYou will work on our core product dashboard, collaborating with designers and backend engineers to ship high-quality features.\n\nWhat you''ll do:\n- Build and maintain reusable React components\n- Collaborate with the design team on UI/UX\n- Write unit and integration tests\n- Conduct code reviews and mentor junior developers\n- Work with TypeScript and modern React patterns',
  E'- 3+ years of React experience\n- Strong TypeScript skills\n- Experience with state management (Redux, Zustand, or similar)\n- Familiarity with REST APIs and GraphQL\n- Experience with testing (Jest, React Testing Library)',
  'full-time', 'Remote', 90000, 130000, '3-5 years', 'Engineering',
  ARRAY['React', 'TypeScript', 'Redux', 'REST API'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 2
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000002',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Node.js Backend Engineer',
  E'Join our backend team to build scalable APIs and microservices.\n\nYou''ll work on our core platform that handles millions of requests per day.\n\nWhat you''ll do:\n- Design and build RESTful APIs using Node.js and Express\n- Work with PostgreSQL and Redis\n- Improve system performance and observability\n- Write clean, well-tested code\n- Participate in on-call rotations',
  E'- 2+ years of Node.js experience\n- Strong SQL knowledge (PostgreSQL preferred)\n- Experience with Docker\n- Understanding of REST API design principles\n- Experience with CI/CD pipelines',
  'full-time', 'Remote', 80000, 120000, '1-3 years', 'Engineering',
  ARRAY['Node.js', 'Express', 'PostgreSQL', 'Docker'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 3
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000003',
  'c1c2c3c4-0002-0002-0002-000000000002',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'Product Designer (UI/UX)',
  E'We are hiring a Product Designer to help shape the visual language of our product.\n\nYou''ll work closely with product managers and engineers to take ideas from wireframe to polished UI.\n\nWhat you''ll do:\n- Create user flows, wireframes, and high-fidelity mockups\n- Conduct user research and usability testing\n- Maintain and evolve our design system\n- Collaborate with engineers on implementation',
  E'- 2+ years of product design experience\n- Proficiency in Figma\n- Strong portfolio demonstrating end-to-end design process\n- Experience with design systems\n- Basic understanding of front-end development',
  'full-time', 'New York, NY', 70000, 100000, '1-3 years', 'Design',
  ARRAY['Figma', 'UI/UX', 'Design Systems', 'User Research'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 4
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000004',
  'c1c2c3c4-0003-0003-0003-000000000003',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'DevOps Engineer',
  E'We are looking for a DevOps Engineer to help us scale our infrastructure.\n\nYou''ll own our CI/CD pipelines, cloud infrastructure, and deployment automation.\n\nWhat you''ll do:\n- Manage AWS infrastructure using Terraform\n- Build and maintain CI/CD pipelines\n- Monitor system health and respond to incidents\n- Champion security and compliance best practices\n- Automate repetitive operational tasks',
  E'- 2+ years of DevOps/SRE experience\n- Strong knowledge of Docker and Kubernetes\n- Experience with Terraform or similar IaC tools\n- AWS or GCP certification preferred\n- Experience with monitoring tools (Datadog, Grafana)',
  'contract', 'Remote', 100000, 140000, '3-5 years', 'DevOps',
  ARRAY['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 5
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000005',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Marketing Intern',
  E'Great opportunity for a marketing student or recent graduate to gain hands-on experience.\n\nYou''ll assist with content creation, social media management, and campaign analysis.\n\nWhat you''ll do:\n- Write blog posts and social media content\n- Assist with email marketing campaigns\n- Analyze campaign performance metrics\n- Support SEO efforts\n- Help organize virtual events',
  E'- Currently enrolled in or recently completed a Marketing degree\n- Strong writing and communication skills\n- Familiarity with social media platforms\n- Basic understanding of SEO\n- Google Analytics experience is a plus',
  'internship', 'Remote', 20000, 30000, '0-1 years', 'Marketing',
  ARRAY['Content Writing', 'Social Media', 'SEO', 'Email Marketing'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 6
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000006',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Full Stack Engineer',
  E'We are growing our engineering team and looking for a Full Stack Engineer who loves building products end to end.\n\nWhat you''ll do:\n- Build features across the entire stack from database to UI\n- Work with React on the frontend and Node.js on the backend\n- Collaborate with product managers and designers\n- Own features from ideation to production\n- Write comprehensive tests',
  E'- 2+ years of full stack development experience\n- Proficiency in React and Node.js\n- Experience with PostgreSQL or MongoDB\n- Understanding of REST API design\n- Experience with Git and agile workflows',
  'full-time', 'Remote', 85000, 125000, '1-3 years', 'Engineering',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'Full Stack'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 7
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000007',
  'c1c2c3c4-0002-0002-0002-000000000002',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'Brand Identity Designer',
  E'Designify Studio is looking for a talented Brand Identity Designer to join our creative team.\n\nWhat you''ll do:\n- Develop brand identities for clients across various industries\n- Create logo systems, typography, and color palettes\n- Present design concepts to clients\n- Collaborate with the wider design team\n- Manage multiple projects simultaneously',
  E'- 3+ years of brand design experience\n- Strong portfolio showing brand identity work\n- Proficiency in Adobe Illustrator and Photoshop\n- Experience with Figma\n- Excellent communication and presentation skills',
  'full-time', 'New York, NY', 65000, 90000, '3-5 years', 'Design',
  ARRAY['Branding', 'Adobe Illustrator', 'Figma', 'Typography'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 8
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000008',
  'c1c2c3c4-0003-0003-0003-000000000003',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Site Reliability Engineer',
  E'CloudScale is looking for an SRE to ensure our systems are reliable, scalable, and efficient.\n\nWhat you''ll do:\n- Define and monitor SLOs and SLAs\n- Build automation to reduce toil\n- Respond to and resolve production incidents\n- Work with engineering teams to improve system reliability\n- Develop runbooks and postmortems',
  E'- 3+ years of SRE or DevOps experience\n- Strong Linux/Unix skills\n- Experience with Kubernetes and Docker\n- Proficiency in at least one scripting language (Python, Go, Bash)\n- Experience with monitoring tools like Prometheus and Grafana',
  'full-time', 'Austin, TX', 110000, 150000, '3-5 years', 'DevOps',
  ARRAY['Kubernetes', 'Prometheus', 'Python', 'Linux', 'SRE'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 9
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000009',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Data Scientist',
  E'We are looking for a Data Scientist to help us make data-driven decisions across the product.\n\nWhat you''ll do:\n- Analyze large datasets to uncover insights\n- Build predictive models and machine learning pipelines\n- Work with engineers to productionize models\n- Present findings to stakeholders\n- Develop dashboards and reporting tools',
  E'- 2+ years of data science experience\n- Proficiency in Python (pandas, scikit-learn, numpy)\n- Experience with SQL\n- Knowledge of machine learning algorithms\n- Experience with data visualization tools',
  'full-time', 'Remote', 95000, 135000, '1-3 years', 'Data Science',
  ARRAY['Python', 'Machine Learning', 'SQL', 'pandas', 'scikit-learn'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 10
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000010',
  'c1c2c3c4-0002-0002-0002-000000000002',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'Motion Graphics Designer',
  E'Designify Studio is looking for a Motion Graphics Designer to bring our clients'' brands to life through animation.\n\nWhat you''ll do:\n- Create motion graphics and animations for digital platforms\n- Develop animated explainer videos\n- Work with the brand team to ensure consistency\n- Produce social media animations\n- Collaborate with video editors',
  E'- 2+ years of motion design experience\n- Proficiency in Adobe After Effects\n- Experience with Cinema 4D is a plus\n- Strong understanding of animation principles\n- Portfolio showing motion design work',
  'full-time', 'New York, NY', 60000, 85000, '1-3 years', 'Design',
  ARRAY['After Effects', 'Motion Design', 'Animation', 'Cinema 4D'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 11
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000011',
  'c1c2c3c4-0003-0003-0003-000000000003',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Cloud Infrastructure Engineer',
  E'CloudScale is hiring a Cloud Infrastructure Engineer to design and implement scalable cloud solutions.\n\nWhat you''ll do:\n- Design multi-region cloud architectures on AWS\n- Implement infrastructure as code using Terraform\n- Optimize cloud costs and performance\n- Ensure security and compliance of cloud environments\n- Mentor junior engineers',
  E'- 4+ years of cloud engineering experience\n- Deep knowledge of AWS services\n- Strong Terraform experience\n- Experience with networking (VPC, subnets, security groups)\n- AWS Solutions Architect certification preferred',
  'full-time', 'Austin, TX', 120000, 160000, '5-10 years', 'DevOps',
  ARRAY['AWS', 'Terraform', 'Cloud Architecture', 'Networking'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 12
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000012',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Product Manager',
  E'We are looking for a Product Manager to lead the development of our core product features.\n\nWhat you''ll do:\n- Define product vision and roadmap\n- Work closely with engineering, design, and stakeholders\n- Write detailed product specifications\n- Analyze user feedback and metrics\n- Drive product launches and go-to-market strategies',
  E'- 3+ years of product management experience\n- Strong analytical and problem-solving skills\n- Experience working with engineering teams\n- Excellent communication skills\n- Experience with agile methodologies',
  'full-time', 'Remote', 100000, 140000, '3-5 years', 'Product',
  ARRAY['Product Management', 'Agile', 'Roadmapping', 'Analytics'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 13
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000013',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Junior Frontend Developer',
  E'Great opportunity for a junior developer to grow their skills in a supportive environment.\n\nWhat you''ll do:\n- Build and maintain UI components using React\n- Work with senior engineers to implement features\n- Fix bugs and improve performance\n- Write unit tests\n- Participate in code reviews',
  E'- 0-1 years of professional experience\n- Solid understanding of HTML, CSS, and JavaScript\n- Basic knowledge of React\n- Familiarity with Git\n- Eagerness to learn and grow',
  'full-time', 'Remote', 50000, 70000, '0-1 years', 'Engineering',
  ARRAY['React', 'JavaScript', 'HTML', 'CSS'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 14
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000014',
  'c1c2c3c4-0002-0002-0002-000000000002',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'UX Researcher',
  E'Designify Studio is looking for a UX Researcher to help our clients understand their users better.\n\nWhat you''ll do:\n- Plan and conduct user research studies\n- Perform usability testing sessions\n- Analyze qualitative and quantitative data\n- Present research findings to clients\n- Collaborate with designers to improve products',
  E'- 2+ years of UX research experience\n- Experience with research methodologies (interviews, surveys, usability testing)\n- Ability to synthesize research into actionable insights\n- Strong presentation skills\n- Experience with tools like UserTesting, Maze, or similar',
  'full-time', 'New York, NY', 70000, 95000, '1-3 years', 'Design',
  ARRAY['UX Research', 'Usability Testing', 'User Interviews', 'Figma'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 15
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000015',
  'c1c2c3c4-0003-0003-0003-000000000003',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Security Engineer',
  E'CloudScale is looking for a Security Engineer to protect our infrastructure and customers'' data.\n\nWhat you''ll do:\n- Conduct security audits and vulnerability assessments\n- Implement and maintain security controls\n- Respond to security incidents\n- Develop security policies and procedures\n- Work with engineering teams to build secure systems',
  E'- 3+ years of security engineering experience\n- Knowledge of cloud security (AWS, GCP, or Azure)\n- Experience with penetration testing\n- Familiarity with compliance frameworks (SOC2, ISO 27001)\n- Security certifications (CISSP, CEH) preferred',
  'full-time', 'Austin, TX', 115000, 155000, '3-5 years', 'Engineering',
  ARRAY['Security', 'AWS', 'Penetration Testing', 'SOC2'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 16
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000016',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Technical Writer',
  E'We are looking for a Technical Writer to create clear and comprehensive documentation for our developer tools.\n\nWhat you''ll do:\n- Write and maintain API documentation\n- Create tutorials and getting started guides\n- Work with engineers to document new features\n- Improve existing documentation based on user feedback\n- Manage documentation website',
  E'- 2+ years of technical writing experience\n- Ability to understand and explain complex technical concepts\n- Experience writing for developer audiences\n- Familiarity with Markdown and documentation tools\n- Basic understanding of programming concepts',
  'contract', 'Remote', 60000, 85000, '1-3 years', 'Engineering',
  ARRAY['Technical Writing', 'API Documentation', 'Markdown', 'Developer Tools'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 17
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000017',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'HR Manager',
  E'TechFlow is looking for an HR Manager to help us build and maintain a world-class team.\n\nWhat you''ll do:\n- Lead recruiting efforts across all departments\n- Manage employee onboarding and offboarding\n- Develop HR policies and procedures\n- Handle employee relations and performance management\n- Build company culture initiatives',
  E'- 3+ years of HR experience in a tech company\n- Experience with recruiting and talent acquisition\n- Knowledge of employment law\n- Strong interpersonal and communication skills\n- Experience with HR software (BambooHR, Workday, etc.)',
  'full-time', 'Remote', 75000, 105000, '3-5 years', 'HR',
  ARRAY['HR', 'Recruiting', 'Talent Acquisition', 'People Operations'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 18
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000018',
  'c1c2c3c4-0002-0002-0002-000000000002',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'Creative Director',
  E'Designify Studio is looking for a Creative Director to lead our creative team and set the vision for our work.\n\nWhat you''ll do:\n- Lead and inspire a team of designers\n- Set creative direction for client projects\n- Present concepts and pitches to clients\n- Ensure quality and consistency across all deliverables\n- Build and maintain client relationships',
  E'- 7+ years of design experience with 2+ years in a leadership role\n- Strong portfolio showing diverse creative work\n- Experience managing and mentoring designers\n- Excellent presentation and communication skills\n- Deep understanding of brand strategy',
  'full-time', 'New York, NY', 120000, 160000, '5-10 years', 'Design',
  ARRAY['Creative Direction', 'Leadership', 'Branding', 'Strategy'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 19
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000019',
  'c1c2c3c4-0003-0003-0003-000000000003',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'Backend Engineer Intern',
  E'CloudScale is offering an internship for backend engineers who want to work on real infrastructure products.\n\nWhat you''ll do:\n- Work on backend services using Go or Python\n- Write and maintain automated tests\n- Participate in code reviews\n- Work with senior engineers on infrastructure projects\n- Learn about cloud infrastructure at scale',
  E'- Currently pursuing a Computer Science degree\n- Basic knowledge of at least one backend language (Python, Go, Java)\n- Familiarity with databases and SQL\n- Understanding of basic networking concepts\n- Eagerness to learn',
  'internship', 'Austin, TX', 25000, 40000, '0-1 years', 'Engineering',
  ARRAY['Python', 'Go', 'Backend', 'Infrastructure'], 'active'
) ON CONFLICT DO NOTHING;
 
-- JOB 20
INSERT INTO jobs (id, company_id, posted_by, title, description, requirements, type, location, salary_min, salary_max, experience, category, tags, status) VALUES
(
  'a0000001-0000-0000-0000-000000000020',
  'c1c2c3c4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'Sales Development Representative',
  E'TechFlow is looking for a Sales Development Representative to help grow our customer base.\n\nWhat you''ll do:\n- Prospect and qualify new leads\n- Conduct outbound outreach via email and phone\n- Schedule demos for the Account Executive team\n- Maintain accurate records in the CRM\n- Collaborate with marketing on campaigns',
  E'- 1+ years of sales or business development experience\n- Excellent written and verbal communication skills\n- Experience with CRM tools (Salesforce, HubSpot)\n- Self-motivated and goal-oriented\n- Interest in the tech industry',
  'full-time', 'Remote', 45000, 65000, '0-1 years', 'Sales',
  ARRAY['Sales', 'CRM', 'Outbound', 'B2B'], 'active'
) ON CONFLICT DO NOTHING;
 
-- ── SAMPLE APPLICATION ─────────────────────────────────────────────────────────
INSERT INTO applications (id, job_id, applicant_id, cover_letter, status) VALUES
  (
    'b0000001-0001-0001-0001-000000000001',
    'a0000001-0000-0000-0000-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'I am a passionate React developer with 4 years of experience building complex SPAs. I have worked extensively with TypeScript and Redux and would love to bring my skills to TechFlow.',
    'pending'
  )
ON CONFLICT DO NOTHING;
 
-- =============================================================================
-- Done! Test accounts:
--   alice@example.com  / password  (jobseeker)
--   bob@example.com    / password  (employer — owns TechFlow Inc.)
--   carol@example.com  / password  (jobseeker)
--   jane@example.com   / password  (employer — owns Designify Studio)
--   mark@example.com   / password  (employer — owns CloudScale Systems)
-- =============================================================================