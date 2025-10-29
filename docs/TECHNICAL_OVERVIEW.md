# Emplea y Emprende Platform - Comprehensive Technical Overview

**Project**: Educational Platform for Youth Employability & Entrepreneurship  
**Version**: 0.1.0  
**Status**: Active Development  
**Repository**: /opt/cemse  

---

## 1. PROJECT STRUCTURE & ARCHITECTURE

### Directory Layout

```
/opt/cemse/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Authentication pages
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   ├── (dashboard)/              # Role-based dashboards (31 sub-routes)
│   │   │   ├── admin/                # Admin dashboard & management
│   │   │   ├── analytics/            # Analytics dashboards
│   │   │   ├── applications/         # Job applications management
│   │   │   ├── candidates/           # Candidate profiles
│   │   │   ├── certificates/         # Certificate management
│   │   │   ├── companies/            # Company management
│   │   │   ├── courses/              # Course management & enrollment
│   │   │   ├── cv-builder/           # CV builder tool
│   │   │   ├── entrepreneurship/     # Entrepreneurship hub
│   │   │   ├── institutions/         # Institution management
│   │   │   ├── jobs/                 # Job listings & applications
│   │   │   ├── messages/             # Messaging system
│   │   │   ├── news/                 # News management
│   │   │   ├── profile/              # User profile
│   │   │   ├── profiles/             # Profile search & discovery
│   │   │   ├── resources/            # Resource library
│   │   │   ├── youth-applications/   # Open youth applications
│   │   │   └── layout.tsx            # Dashboard layout wrapper
│   │   ├── api/                      # Backend API routes (151 endpoints)
│   │   │   ├── admin/                # Admin management endpoints
│   │   │   ├── analytics/            # Analytics APIs
│   │   │   ├── applications/         # Job application APIs
│   │   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── business-plans/       # Business plan APIs
│   │   │   ├── candidates/           # Candidate APIs
│   │   │   ├── certificates/         # Certificate generation
│   │   │   ├── companies/            # Company management
│   │   │   ├── courses/              # Course management (nested routes)
│   │   │   ├── entrepreneurship/     # Entrepreneurship APIs
│   │   │   ├── files/                # File upload & storage
│   │   │   ├── institutions/         # Institution management
│   │   │   ├── jobs/                 # Job management
│   │   │   ├── messages/             # Messaging APIs
│   │   │   ├── news/                 # News APIs
│   │   │   ├── profiles/             # Profile management
│   │   │   ├── public/               # Public APIs (no auth required)
│   │   │   ├── quizzes/              # Quiz management
│   │   │   ├── resources/            # Resource management
│   │   │   ├── search/               # Global search endpoints
│   │   │   └── youth-applications/   # Youth application APIs
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout with auth wrapper
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                   # Reusable React components (25 subdirs)
│   │   ├── analytics/                # Analytics charts & dashboards
│   │   ├── auth/                     # Authentication UI
│   │   ├── candidates/               # Candidate cards & search
│   │   ├── certificates/             # Certificate display
│   │   ├── companies/                # Company profiles & forms
│   │   ├── company/                  # Company-specific components
│   │   ├── content/                  # Content management
│   │   ├── courses/                  # Course components (largest)
│   │   ├── cv-builder/               # CV builder UI (1,479 lines)
│   │   ├── dashboard/                # Dashboard components (11 components)
│   │   ├── entrepreneurship/         # Entrepreneurship UI (43 files)
│   │   ├── files/                    # File upload components
│   │   ├── institutions/             # Institution management UI
│   │   ├── instructor/               # Instructor dashboard
│   │   ├── interviews/               # Interview system UI
│   │   ├── jobs/                     # Job search & application UI
│   │   ├── messaging/                # Chat & messaging UI
│   │   ├── news/                     # News display
│   │   ├── profile/                  # Profile management (13 components)
│   │   ├── resources/                # Resource display
│   │   ├── search/                   # Search interface
│   │   ├── ui/                       # Radix UI primitives (re-exports)
│   │   ├── youth-applications/       # Youth application UI
│   │   └── LandingHeader.tsx         # Landing page header
│   │
│   ├── hooks/                        # Custom React hooks (48 hooks)
│   │   ├── useAdminStats.ts
│   │   ├── useApplications.ts
│   │   ├── useCandidates.ts
│   │   ├── useCertificates.ts
│   │   ├── useChunkedUpload.ts
│   │   ├── useCompanies.ts
│   │   ├── useCompanyAnalytics.ts
│   │   ├── useCourseAnalytics.ts
│   │   ├── useCourses.ts
│   │   ├── useCVData.ts
│   │   ├── useDiscussions.ts
│   │   ├── useEntrepreneurshipConnections.ts
│   │   ├── useEntrepreneurships.ts
│   │   ├── useInstitutionAnalytics.ts
│   │   ├── useInstitutionStudents.ts
│   │   ├── useJobs.ts
│   │   ├── useMessages.ts
│   │   ├── useProfiles.ts
│   │   ├── useResources.ts
│   │   ├── useYouthApplications.ts
│   │   └── ... (28 more hooks)
│   │
│   ├── lib/                          # Utilities & services
│   │   ├── analyticsService.ts       # Analytics calculations
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── businessPlanService.ts    # Business plan logic
│   │   ├── businessPlanExportService.ts
│   │   ├── businessPlanTemplates.ts
│   │   ├── businessPlanValidationService.ts
│   │   ├── certificateService.ts     # Certificate generation
│   │   ├── colors.ts                 # Color utilities
│   │   ├── cvBuilderService.tsx      # CV builder logic
│   │   ├── financialCalculatorService.ts
│   │   ├── imageUtils.ts             # Image processing
│   │   ├── input-validator.ts        # Input validation schemas
│   │   ├── minioService.ts           # MinIO integration
│   │   ├── minioClientService.ts
│   │   ├── password-validator.ts     # Password validation
│   │   ├── postEngagementService.ts  # Post engagement metrics
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── rate-limiter.ts           # Rate limiting logic
│   │   ├── searchService.ts          # Global search service
│   │   ├── security-logger.ts        # Security event logging
│   │   ├── sidebarData.ts            # Navigation structure
│   │   ├── translations.ts           # i18n strings
│   │   ├── utils.ts                  # General utilities
│   │   └── providers/                # React context providers
│   │
│   ├── types/                        # TypeScript type definitions
│   │   ├── index.ts                  # Main types (exported from Prisma)
│   │   ├── company.ts                # Company-specific types
│   │   ├── youth-application.ts      # Youth application types
│   │   └── next-auth.d.ts            # NextAuth type extensions
│   │
│   └── middleware.ts                 # Next.js middleware for auth & routing

├── prisma/                           # Database schema & migrations
│   ├── schema.prisma                 # Main schema (1,145 lines)
│   ├── seed.ts                       # Data seeding script
│   ├── seed-enhanced.ts
│   ├── seed-comprehensive.ts         # Comprehensive seeding
│   └── migrations/                   # Migration history (15+ migrations)

├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/

├── Configuration Files
│   ├── package.json                  # Dependencies & scripts (131 total)
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── next.config.ts                # Next.js configuration
│   ├── tailwind.config.ts            # Tailwind CSS configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── jest.config.js                # Testing configuration
│   ├── jest.setup.js
│   ├── eslint.config.mjs             # ESLint rules
│   ├── docker-compose.yml            # Docker services
│   ├── Dockerfile                    # Container image
│   ├── .env                          # Environment variables
│   ├── env.template                  # Environment template
│   └── pnpm-lock.yaml                # Dependency lock file

├── Documentation
│   ├── README.md                     # Quick start guide
│   ├── DEPLOYMENT.md                 # Deployment instructions
│   ├── cemse.md                      # Project documentation (41KB)
│   └── docs/                         # Additional documentation

└── Supporting Files
    ├── server.ts                     # Development server
    ├── manage.sh                     # Service management script
    ├── update.sh                     # Deployment update script
    ├── setup.sh                      # Initial setup (Linux)
    ├── setup-ubuntu.sh               # Setup for Ubuntu 24.04
    ├── clean-cache.js                # Build cache cleanup
    └── pnpm-workspace.yaml           # Workspace configuration
```

---

## 2. TECHNOLOGY STACK

### Core Framework & Runtime
- **Next.js 15.1.7** - React framework with App Router (Server Components)
- **React 19.0.0** - UI library with hooks
- **TypeScript 5.x** - Type safety
- **Node.js 20+** - Runtime environment
- **pnpm** - Package manager (faster, more efficient than npm)

### Database & ORM
- **PostgreSQL 15** - Relational database
- **Prisma 6.16.1** - ORM with type-safe queries
- **Prisma Client** - Database client
- **Prisma Studio** - Database GUI

### Authentication & Authorization
- **NextAuth.js 4.24.11** - Authentication solution
- **@auth/prisma-adapter** - Prisma adapter for NextAuth
- **bcryptjs 3.0.2** - Password hashing
- **JWT** - Token-based authentication
- **Custom Rate Limiter** - Login attempt limiting

### File Storage & Media
- **MinIO 8.0.6** - S3-compatible object storage
- **busboy 1.6.0** - Multipart form data parser
- **canvas 3.2.0** - Image processing & PDF generation
- **@react-pdf/renderer 4.3.0** - PDF document creation

### Caching & Sessions
- **Redis 7** - In-memory caching
- **Session Management** - JWT-based sessions

### Frontend UI & Components
- **Radix UI** - Headless component library
  - react-accordion, react-alert-dialog, react-avatar, react-checkbox
  - react-dialog, react-dropdown-menu, react-label, react-popover
  - react-progress, react-radio-group, react-scroll-area, react-select
  - react-separator, react-slider, react-switch, react-tabs, react-toast, react-tooltip
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **tailwindcss-animate 1.0.7** - Animation utilities
- **tailwind-merge 3.3.1** - Class merging
- **Lucide React 0.544.0** - Icon library (544+ icons)
- **Framer Motion 12.23.12** - Animation library
- **clsx 2.1.1** - Conditional className utility
- **class-variance-authority 0.7.1** - Component variant generation

### Form Management & Validation
- **React Hook Form 7.62.0** - Efficient form handling
- **@hookform/resolvers 5.2.1** - Form validation resolvers
- **Zod 4.1.8** - TypeScript-first schema validation
- **isomorphic-dompurify 2.28.0** - DOM sanitization

### Data Fetching & State Management
- **@tanstack/react-query 5.87.4** - Server state management
- **@tanstack/react-query-devtools 5.87.4** - Debugging tools

### Utilities & Libraries
- **date-fns 4.1.0** - Date manipulation
- **crypto-js 4.2.0** - Cryptography utilities
- **react-dropzone 14.3.8** - File drop zone component
- **react-leaflet 5.0.0** - Map integration
- **leaflet 1.9.4** - Mapping library
- **sonner 2.0.7** - Toast notifications
- **dotenv 17.2.2** - Environment variable management
- **resend 6.0.3** - Email service
- **cookie 1.0.0** - Cookie management

### Development Tools
- **ESLint 9.x** - Code linting
- **Prettier 3.6.2** - Code formatting
- **Jest 30.1.3** - Testing framework
- **@testing-library/react 16.3.0** - React testing utilities
- **tsx 4.20.5** - TypeScript execution for scripts

### Deployment & Container
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server (for production)

---

## 3. MAIN MODULES & FEATURES

### A. Authentication System
**Files**: `/src/app/api/auth/*`, `/src/lib/auth.ts`
- Multi-role authentication (YOUTH, COMPANIES, INSTITUTION, SUPERADMIN)
- Credential-based login with rate limiting
- User registration with role-specific setup
- Password reset & change flows
- JWT token management
- Session persistence via NextAuth.js

**Routes**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/forgot-password` - Password recovery
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/change-password` - Change password

### B. User Profiles & Management
**Files**: `/src/components/profile/*`, `/src/app/(dashboard)/profile/*`
- Comprehensive profile management
- Profile completion tracking
- Document upload (CV, cover letters)
- Skill assessment & endorsement
- Education & experience tracking
- Social links management
- Avatar & file upload

**Key Data**:
- Personal info (name, phone, address, document)
- Education history with graduation year
- Work experience with detailed descriptions
- Skills with proficiency levels
- Languages spoken
- Projects portfolio
- Cover letter builder with templates
- Academic achievements

**Routes**:
- `GET /api/profile/me` - Get current user profile
- `GET /api/profiles` - Search/list profiles
- `POST /api/profiles` - Update profile

### C. Job Management System
**Files**: `/src/components/jobs/*`, `/src/app/api/jobs/*`, `/src/app/(dashboard)/jobs/*`
- Job posting & management
- Advanced job search with filters
- Job application tracking
- Multi-step application process
- Custom application questions
- Application status workflow

**Features**:
- Salary range with currency support
- Contract type filtering (Full-time, Part-time, Internship, Volunteer, Freelance)
- Work modality (On-site, Remote, Hybrid)
- Experience level requirements
- Skill matching
- Geolocation (latitude/longitude)
- Application deadline tracking
- Featured job listings

**Application Statuses**: SENT → UNDER_REVIEW → PRE_SELECTED → REJECTED/HIRED

**Routes**:
- `GET /api/jobs` - List jobs with filters
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `POST /api/applications` - Submit application
- `GET /api/applications` - List applications
- `GET /api/companies/[id]/jobs` - Company jobs
- `GET /api/candidates` - Browse candidates

### D. Course Management System
**Files**: `/src/components/courses/*`, `/src/app/api/courses/*`
**Largest Component**: `UnifiedCourseManager.tsx` (1,058 lines)

**Course Structure**:
```
Course
  └── CourseModule (multiple)
       └── Lesson (multiple)
            ├── Quiz (optional)
            └── Resources
```

**Features**:
- Course creation with categories (8 categories)
- Modular course structure
- Lesson management (multiple content types)
- Quiz & assessment system
- Progress tracking
- Certificate generation upon completion
- Module completion tracking
- Enrollment management

**Content Types**: VIDEO, AUDIO, TEXT, QUIZ, EXERCISE, DOCUMENT, INTERACTIVE

**Course Categories**:
- SOFT_SKILLS
- BASIC_COMPETENCIES
- JOB_PLACEMENT
- ENTREPRENEURSHIP
- TECHNICAL_SKILLS
- DIGITAL_LITERACY
- COMMUNICATION
- LEADERSHIP

**Levels**: BEGINNER, INTERMEDIATE, ADVANCED

**Routes**:
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `POST /api/courses/[id]/enroll` - Enroll in course
- `GET /api/courses/[id]/progress` - Get progress
- `GET /api/courses/[id]/modules` - List modules
- `POST /api/courses/[id]/modules/[moduleId]/lessons` - Add lessons
- `GET /api/courses/[id]/quizzes` - Get quizzes
- `POST /api/quizzes/[id]/attempts` - Submit quiz
- `GET /api/courses/analytics` - Course analytics

### E. Institution Management
**Files**: `/src/components/institutions/*`, `/src/app/api/institutions/*`

**Features**:
- Multi-institution support
- Student enrollment & management
- Course creation & management
- Analytics & reporting
- Student progress tracking
- Approval workflows

**Institution Types**:
- MUNICIPALITY
- NGO
- TRAINING_CENTER
- FOUNDATION
- OTHER

**Routes**:
- `POST /api/institutions` - Create institution
- `GET /api/institutions/[id]` - Get institution details
- `GET /api/institutions/[id]/students` - List students
- `GET /api/institutions/[id]/courses` - List courses
- `GET /api/institutions/[id]/enrollments` - Get enrollments
- `GET /api/institutions/[id]/reports` - Generate reports
- `GET /api/institutions/[id]/analytics` - Institution analytics

### F. Company Management
**Files**: `/src/components/companies/*`, `/src/components/company/*`, `/src/app/api/companies/*`

**Features**:
- Company profile creation & management
- Job posting management
- Candidate browsing & search
- Application management
- Hiring analytics
- Employee management
- Company approval workflow

**Company Approval**: PENDING → APPROVED/REJECTED

**Routes**:
- `POST /api/companies` - Create company
- `GET /api/companies` - List companies
- `GET /api/companies/[id]` - Get company details
- `GET /api/companies/[id]/jobs` - Company jobs
- `POST /api/companies/[id]/jobs` - Post job
- `GET /api/companies/[id]/hiring-metrics` - Hiring stats
- `GET /api/companies/[id]/analytics` - Company analytics
- `GET /api/companies/[id]/employees` - Employee roster

### G. Entrepreneurship Hub
**Files**: `/src/components/entrepreneurship/*` (43 files), `/src/app/api/entrepreneurship/*`

**Features**:
- Entrepreneurship profile creation
- Business plan builder (1,326 lines)
  - Triple Impact Assessment
  - Business Model Canvas
  - Financial Projections
- Post creation & sharing
- Community engagement (likes, comments)
- Business connections/networking
- Entrepreneurship resources library
- News & updates

**Business Stages**: IDEA, STARTUP, GROWING, ESTABLISHED

**Post Types**: TEXT, IMAGE, VIDEO, LINK, POLL, EVENT, QUESTION, ACHIEVEMENT, ANNOUNCEMENT

**Routes**:
- `GET /api/entrepreneurship/entrepreneurships` - List businesses
- `POST /api/entrepreneurship/entrepreneurships` - Create business
- `GET /api/entrepreneurship/posts` - List posts
- `POST /api/entrepreneurship/posts` - Create post
- `POST /api/entrepreneurship/posts/[id]/like` - Like post
- `POST /api/entrepreneurship/posts/[id]/comments` - Add comment
- `GET /api/entrepreneurship/connections` - Get connections
- `POST /api/entrepreneurship/connections` - Request connection
- `GET /api/entrepreneurship/resources` - List resources
- `GET /api/entrepreneurship/news` - News feed

### H. Youth Applications System
**Files**: `/src/components/youth-applications/*`, `/src/app/api/youth-applications/*`

**Features**:
- Youth open applications (self-promotion)
- Companies can browse & express interest
- Chat enablement upon interest
- Interest tracking & status management
- Document upload (CV, cover letter)
- Public/private visibility

**Statuses**: ACTIVE, PAUSED, CLOSED, HIRED

**Routes**:
- `POST /api/youth-applications` - Create application
- `GET /api/youth-applications` - List applications
- `GET /api/youth-applications/[id]` - Get details
- `POST /api/youth-applications/[id]/interests` - Add interest
- `GET /api/youth-applications/[id]/interests` - List interests

### I. Messaging System
**Files**: `/src/components/messaging/*`, `/src/app/api/messages/*`

**Features**:
- Unified messaging across platform
- Context-aware messaging (Job, Youth App, Entrepreneurship, General)
- Real-time message delivery
- Read status tracking
- Conversation management
- File attachments

**Message Contexts**:
- JOB_APPLICATION - Job-related messages
- YOUTH_APPLICATION - Youth app messages
- ENTREPRENEURSHIP - Business messages
- GENERAL - Direct messages

**Routes**:
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/interviews/[id]/messages` - Interview messages

### J. Analytics System
**Files**: `/src/lib/analyticsService.ts`, `/src/app/api/analytics/*`, `/src/app/api/*/analytics/*`

**Features**:
- Course analytics (enrollment, completion, scores)
- Job analytics (applications, conversion, views)
- Institution analytics (student progress, course stats)
- Company analytics (hiring metrics, application flow)
- User profile analytics
- Engagement tracking

**Metrics Tracked**:
- Views, clicks, conversions
- Completion rates
- Time spent
- Quiz scores
- Application statuses
- Hiring funnels

**Routes**:
- `GET /api/analytics` - Global analytics
- `GET /api/courses/analytics` - Course analytics
- `GET /api/courses/analytics/reports` - Detailed reports
- `GET /api/company/analytics` - Company metrics
- `GET /api/institutions/[id]/analytics` - Institution metrics
- `GET /api/companies/[id]/analytics` - Company hiring metrics

### K. File Management & Storage
**Files**: `/src/app/api/files/*`, `/src/lib/minioService.ts`

**Features**:
- MinIO integration for S3-compatible storage
- Chunked file uploads (large video support)
- Image optimization
- Presigned URLs for downloads
- Bucket management
- File type validation

**Buckets**: uploads, videos, images, documents, audio, temp

**Routes**:
- `POST /api/files/upload` - Upload file
- `POST /api/files/chunked-upload` - Chunked upload start
- `POST /api/files/finalize-upload` - Complete chunked upload
- `GET /api/files/minio/presigned` - Get presigned URL
- `POST /api/files/minio/upload` - Direct MinIO upload
- `GET /api/files/minio/status` - Storage status

### L. Search System
**Files**: `/src/lib/searchService.ts`, `/src/app/api/search/*`

**Features**:
- Global search across jobs, companies, profiles, courses, institutions
- Full-text search capability
- Filter support (location, category, skills, salary, experience)
- Relevance scoring
- Search suggestions
- Popular searches

**Routes**:
- `GET /api/search` - Global search
- `GET /api/search/suggestions` - Search suggestions
- `GET /api/search/popular` - Popular searches

### M. Certificates & Credentials
**Files**: `/src/components/certificates/*`, `/src/app/api/certificates/*`

**Features**:
- Certificate generation upon course completion
- Module certificates
- PDF certificate creation
- Digital credential storage
- Certificate download

**Routes**:
- `GET /api/certificates` - List certificates
- `POST /api/certificates/generate` - Generate certificate
- `GET /api/certificates/[id]/download` - Download PDF

### N. Admin Dashboard
**Files**: `/src/components/dashboard/AdminDashboard.tsx`, `/src/app/api/admin/*`

**Features**:
- User management
- Company approval workflow
- Institution approval workflow
- System statistics
- Platform monitoring

**Routes**:
- `GET /api/admin/users` - List users
- `GET /api/admin/companies` - List companies
- `GET /api/admin/pending-companies` - Pending approvals
- `POST /api/admin/pending-companies/[id]/approve` - Approve company
- `POST /api/admin/pending-companies/[id]/reject` - Reject company
- `GET /api/admin/stats` - Platform statistics

### O. Search & Discovery
**Files**: `/src/components/search/*`, `/src/app/api/search/*`

- Global search interface
- Advanced filtering
- Result ranking
- Search history
- Popular searches

### P. Resources & Knowledge Base
**Files**: `/src/components/resources/*`, `/src/app/api/resources/*`

**Features**:
- Resource library
- Multiple resource types
- Tagging & categorization
- Download tracking
- Rating & reviews

**Resource Types**:
- ARTICLE, VIDEO, AUDIO, DOCUMENT
- TOOL, TEMPLATE, GUIDE, CHECKLIST
- WEBINAR, COURSE

**Routes**:
- `GET /api/resources` - List resources
- `POST /api/resources` - Create resource
- `GET /api/resources/[id]` - Get resource
- `GET /api/entrepreneurship/resources` - Entrepreneurship resources

---

## 4. DATABASE SCHEMA & MODELS (Prisma)

### Core User Models

```prisma
User
├── id (CUID, PK)
├── email (unique)
├── password (hashed)
├── role (enum: YOUTH, COMPANIES, INSTITUTION, SUPERADMIN)
├── isActive (boolean)
├── refreshToken
├── firstName, lastName
├── timestamps (createdAt, updatedAt)
└── Relations
    ├── profile (1:1 Profile)
    ├── createdCompanies (1:N Company)
    ├── createdInstitutions (1:N Institution)
    ├── createdResources (1:N Resource)
    ├── createdNews (1:N NewsArticle)
    └── businessPlans (1:N BusinessPlan)

Profile
├── id (CUID, PK)
├── userId (FK, unique)
├── avatarUrl, firstName, lastName
├── phone, address, country, city, state
├── birthDate, gender
├── documentType, documentNumber
├── educationLevel (enum)
├── currentInstitution, graduationYear, isStudying
├── skills (JSON), interests (JSON)
├── socialLinks (JSON), workExperience (JSON)
├── jobTitle, experienceLevel
├── languages (JSON), projects (JSON), websites (JSON)
├── CV fields (cvUrl, cvTemplate, coverLetterUrl, coverLetterContent)
├── educationHistory (JSON), academicAchievements (JSON)
├── gpa, universityName, universityStartDate, universityEndDate
├── profileCompletion (0-100%)
├── status (enum: ACTIVE, INACTIVE, PENDING_VERIFICATION, SUSPENDED)
├── parentalConsent (boolean)
├── lastLoginAt
├── institutionId (FK)
└── Relations
    ├── user (User)
    ├── institution (Institution)
    ├── courseEnrollments (1:N CourseEnrollment)
    ├── instructedCourses (1:N Course)
    ├── entrepreneurships (1:N Entrepreneurship)
    ├── jobApplications (1:N JobApplication)
    ├── youthApplications (1:N YouthApplication)
    ├── quizAttempts (1:N QuizAttempt)
    ├── sentMessages (1:N Message)
    ├── receivedMessages (1:N Message)
    ├── entrepreneurshipConnectionsSent (1:N EntrepreneurshipConnection)
    ├── entrepreneurshipConnectionsReceived (1:N EntrepreneurshipConnection)
    ├── companyEmployments (1:N CompanyEmployee)
    ├── certificates (1:N Certificate)
    ├── moduleCertificates (1:N ModuleCertificate)
    ├── lessonProgress (1:N LessonProgress)
    ├── entrepreneurshipPosts (1:N EntrepreneurshipPost)
    ├── postLikes (1:N PostLike)
    ├── postComments (1:N PostComment)
    └── entrepreneurshipResources (1:N EntrepreneurshipResource)
```

### Job System Models

```prisma
JobOffer
├── id (CUID, PK)
├── title, description, requirements, responsibilities
├── benefits, salaryMin, salaryMax, salaryCurrency
├── contractType (enum)
├── workSchedule, workModality (enum: ON_SITE, REMOTE, HYBRID)
├── location, city, state, country, municipality, department
├── experienceLevel (enum)
├── educationRequired (enum)
├── skillsRequired, desiredSkills (arrays)
├── tags, images, logo
├── applicationDeadline, startDate
├── isUrgent, isActive
├── status (enum: ACTIVE, PAUSED, CLOSED, DRAFT)
├── featured, viewsCount, applicationsCount
├── companyId (FK)
├── timestamps
└── Relations
    ├── company (Company)
    ├── applications (1:N JobApplication)
    └── jobQuestions (1:N JobQuestion)

JobApplication
├── id (CUID, PK)
├── applicantId (FK)
├── jobOfferId (FK)
├── coverLetter, cvFile, coverLetterFile
├── cvData (JSON)
├── status (enum: SENT, UNDER_REVIEW, PRE_SELECTED, REJECTED, HIRED)
├── appliedAt, reviewedAt, hiredAt, terminatedAt
├── notes, rating (1-5)
├── decisionReason
├── employeeStatus (enum: ACTIVE, TERMINATED, ON_LEAVE)
├── Unique constraint on (applicantId, jobOfferId)
└── Relations
    ├── applicant (Profile)
    ├── jobOffer (JobOffer)
    └── questionAnswers (1:N JobQuestionAnswer)

JobQuestion
├── id (CUID, PK)
├── jobOfferId (FK)
├── question (text)
├── type (text, multiple_choice, etc.)
├── options (JSON)
├── isRequired, orderIndex
└── Relations
    ├── jobOffer (JobOffer)
    └── answers (1:N JobQuestionAnswer)

JobQuestionAnswer
├── id (CUID, PK)
├── applicationId (FK)
├── questionId (FK)
├── answer (text)
├── Unique constraint on (applicationId, questionId)
└── Relations
    ├── application (JobApplication)
    └── question (JobQuestion)
```

### Course System Models

```prisma
Course
├── id (CUID, PK)
├── title, slug (unique), description, shortDescription
├── thumbnail, videoPreview
├── objectives, prerequisites (arrays)
├── duration (minutes), level (enum)
├── category (enum: 8 categories)
├── isMandatory, isActive, certification
├── rating, studentsCount, completionRate
├── totalLessons, totalQuizzes, totalResources
├── tags, includedMaterials (arrays)
├── instructorId (FK), institutionId (FK)
├── institutionName
├── timestamps, publishedAt
└── Relations
    ├── certificates (1:N Certificate)
    ├── enrollments (1:N CourseEnrollment)
    ├── modules (1:N CourseModule)
    ├── instructor (Profile)
    ├── institution (Institution)
    └── quizzes (1:N Quiz)

CourseModule
├── id (CUID, PK)
├── courseId (FK)
├── title, description
├── orderIndex, estimatedDuration
├── isLocked (boolean)
├── prerequisites (array)
├── certificateTemplate
├── hasCertificate
└── Relations
    ├── course (Course)
    ├── lessons (1:N Lesson)
    └── moduleCertificates (1:N ModuleCertificate)

Lesson
├── id (CUID, PK)
├── moduleId (FK)
├── title, description
├── content, contentType (enum: 7 types)
├── videoUrl, audioUrl, attachments (JSON)
├── duration, orderIndex
├── isRequired, isPreview
└── Relations
    ├── module (CourseModule)
    ├── progress (1:N LessonProgress)
    └── quizzes (1:N Quiz)

CourseEnrollment
├── id (CUID, PK)
├── studentId (FK)
├── courseId (FK)
├── enrolledAt, completedAt
├── progress (0-100%)
├── status (active, completed, paused)
├── Unique constraint on (studentId, courseId)
└── Relations
    ├── student (Profile)
    └── course (Course)

Quiz
├── id (CUID, PK)
├── courseId (FK), lessonId (FK)
├── title, description
├── questions (JSON)
├── passingScore (default: 70)
├── timeLimit, attempts (0 = unlimited)
├── isActive
├── timestamps
└── Relations
    ├── course (Course)
    ├── lesson (Lesson)
    └── quizAttempts (1:N QuizAttempt)

QuizAttempt
├── id (CUID, PK)
├── quizId (FK)
├── studentId (FK)
├── answers (JSON)
├── score, passed (boolean)
├── completedAt, timeSpent
└── Relations
    ├── quiz (Quiz)
    └── student (Profile)

Certificate
├── id (CUID, PK)
├── courseId (FK)
├── studentId (FK)
├── issuedAt
├── fileUrl
├── certificateType (default: "course")
├── Unique constraint on (courseId, studentId)
└── Relations
    ├── course (Course)
    └── student (Profile)

ModuleCertificate
├── id (CUID, PK)
├── moduleId (FK)
├── studentId (FK)
├── issuedAt, fileUrl
├── Unique constraint on (moduleId, studentId)
└── Relations
    ├── module (CourseModule)
    └── student (Profile)

LessonProgress
├── id (CUID, PK)
├── studentId (FK)
├── lessonId (FK)
├── completed (boolean)
├── completedAt, timeSpent (seconds)
├── Unique constraint on (studentId, lessonId)
└── Relations
    ├── lesson (Lesson)
    └── student (Profile)
```

### Job & Company Models

```prisma
Company
├── id (CUID, PK)
├── name, description
├── taxId, legalRepresentative
├── businessSector
├── companySize (enum: MICRO, SMALL, MEDIUM, LARGE)
├── website, email (unique), phone
├── address, foundedYear
├── logoUrl
├── password (for company auth)
├── isActive
├── approvalStatus (enum: PENDING, APPROVED, REJECTED)
├── approvedBy, approvedAt
├── rejectionReason
├── institutionId (FK)
├── createdBy (FK to User)
├── ownerId
├── timestamps
├── Unique constraint on (name, institutionId)
└── Relations
    ├── creator (User)
    ├── institution (Institution)
    ├── jobOffers (1:N JobOffer)
    ├── youthApplicationInterests (1:N YouthApplicationCompanyInterest)
    └── employees (1:N CompanyEmployee)

CompanyEmployee
├── id (CUID, PK)
├── companyId (FK)
├── employeeId (FK to Profile userId)
├── position, salary
├── contractType (enum)
├── status (enum: ACTIVE, TERMINATED, ON_LEAVE)
├── hiredAt, terminatedAt
├── notes
├── Unique constraint on (companyId, employeeId)
└── Relations
    ├── company (Company)
    └── employee (Profile)
```

### Institution Models

```prisma
Institution
├── id (CUID, PK)
├── name, department
├── region, population
├── mayorName, mayorEmail, mayorPhone
├── address, website
├── email (unique), phone
├── password
├── institutionType (enum: 5 types)
├── customType
├── primaryColor, secondaryColor (branding)
├── isActive
├── approvalStatus (enum)
├── approvedBy, approvedAt
├── rejectionReason
├── createdBy (FK to User)
├── timestamps
├── Unique constraint on (name, department)
└── Relations
    ├── creator (User)
    ├── companies (1:N Company)
    ├── profiles (1:N Profile - students)
    └── courses (1:N Course)
```

### Entrepreneurship Models

```prisma
Entrepreneurship
├── id (CUID, PK)
├── ownerId (FK to Profile userId)
├── name, description
├── category, subcategory
├── businessStage (enum: IDEA, STARTUP, GROWING, ESTABLISHED)
├── logo, images (array)
├── website, email, phone, address
├── municipality, department
├── socialMedia (JSON)
├── founded, employees, annualRevenue
├── businessModel, targetMarket
├── isPublic, isActive
├── viewsCount, rating, reviewsCount
├── timestamps
└── Relations
    └── owner (Profile)

BusinessPlan
├── id (CUID, PK)
├── userId (FK)
├── content (JSON)
├── status (draft, submitted, approved)
├── marketAnalysis (JSON)
├── tripleImpactAssessment (JSON)
├── businessModelCanvas (JSON)
├── financialProjections (JSON)
├── completionPercentage (0-100%)
├── timestamps
└── Relations
    └── user (User)

EntrepreneurshipConnection
├── id (CUID, PK)
├── requesterId (FK to Profile userId)
├── addresseeId (FK to Profile userId)
├── status (enum: PENDING, ACCEPTED, DECLINED, BLOCKED)
├── message (optional)
├── createdAt, acceptedAt
├── Unique constraint on (requesterId, addresseeId)
└── Relations
    ├── requester (Profile)
    └── addressee (Profile)

EntrepreneurshipPost
├── id (CUID, PK)
├── content (text)
├── type (enum: 9 types)
├── images (array)
├── tags (array)
├── likes, comments, shares, views (counts)
├── isPinned, isPublic
├── authorId (FK)
├── timestamps
└── Relations
    ├── author (Profile)
    ├── postLikes (1:N PostLike)
    └── postComments (1:N PostComment)

PostLike
├── id (CUID, PK)
├── postId (FK)
├── userId (FK)
├── createdAt
├── Unique constraint on (postId, userId)
└── Relations
    ├── post (EntrepreneurshipPost)
    └── user (Profile)

PostComment
├── id (CUID, PK)
├── postId (FK)
├── authorId (FK)
├── content (text)
├── parentId (FK - for nested replies)
├── likes (count)
├── timestamps
└── Relations
    ├── post (EntrepreneurshipPost)
    ├── author (Profile)
    ├── parent (PostComment)
    └── replies (1:N PostComment)

EntrepreneurshipResource
├── id (CUID, PK)
├── title, description, content
├── type (enum: 9 types)
├── category, tags (arrays)
├── url, fileUrl, imageUrl
├── isPublic, isFeatured
├── views, likes (counts)
├── authorId (FK)
├── timestamps
└── Relations
    └── author (Profile)
```

### Youth Application Models

```prisma
YouthApplication
├── id (CUID, PK)
├── youthProfileId (FK to Profile userId)
├── title, description
├── cvFile, coverLetterFile
├── cvUrl, coverLetterUrl
├── status (enum: ACTIVE, PAUSED, CLOSED, HIRED)
├── isPublic, viewsCount, applicationsCount
├── timestamps
└── Relations
    ├── youthProfile (Profile)
    └── companyInterests (1:N YouthApplicationCompanyInterest)

YouthApplicationCompanyInterest
├── id (CUID, PK)
├── applicationId (FK)
├── companyId (FK)
├── status (enum: INTERESTED, CONTACTED, INTERVIEW_SCHEDULED, HIRED, NOT_INTERESTED)
├── interestedAt, contactedAt
├── notes
├── Unique constraint on (applicationId, companyId)
└── Relations
    ├── application (YouthApplication)
    └── company (Company)
```

### Messaging Models

```prisma
Message
├── id (CUID, PK)
├── senderId (FK)
├── recipientId (FK)
├── content (text)
├── messageType (text, image, etc.)
├── attachments (JSON)
├── contextType (enum: 4 types)
├── contextId (optional - for related entity)
├── createdAt, readAt
└── Relations
    ├── sender (Profile)
    └── recipient (Profile)
```

### News & Resources Models

```prisma
NewsArticle
├── id (CUID, PK)
├── title, content, summary
├── imageUrl, videoUrl
├── authorId (FK)
├── authorName, authorType (enum: COMPANY, INSTITUTION, ADMIN)
├── authorLogo
├── status (enum: PUBLISHED, DRAFT, ARCHIVED)
├── priority (enum: LOW, MEDIUM, HIGH, URGENT)
├── featured (boolean)
├── tags, category (arrays/string)
├── publishedAt, expiresAt
├── viewCount, likeCount, commentCount
├── targetAudience (array)
├── region
├── relatedLinks (JSON)
├── isEntrepreneurshipRelated (boolean)
├── timestamps
└── Relations
    └── author (User)

Resource
├── id (CUID, PK)
├── title, description
├── type, category, format
├── downloadUrl, externalUrl
├── thumbnail, author
├── publishedDate
├── downloads, rating (1-5)
├── tags (array)
├── isPublic, isEntrepreneurshipRelated
├── createdByUserId (FK)
├── status (PUBLISHED, DRAFT, etc.)
├── timestamps
└── Relations
    └── createdBy (User)
```

### Question & Answer System

```prisma
Question
├── id (CUID, PK)
├── title, content
├── category, difficulty
├── points
├── isActive
├── timestamps
└── Relations
    └── answers (1:N Answer)

Answer
├── id (CUID, PK)
├── questionId (FK)
├── content
├── isCorrect (boolean)
├── orderIndex
├── timestamps
└── Relations
    └── question (Question)
```

### Indexes & Performance
- Indexed on frequently queried fields
- Composite indexes for complex queries
- Unique constraints for data integrity
- Foreign key relationships maintained

---

## 5. API ROUTES & ENDPOINTS (151 Total)

### Authentication Endpoints (5)
```
POST   /api/auth/register                    - User registration
POST   /api/auth/[...nextauth]               - NextAuth handler
POST   /api/auth/forgot-password             - Request password reset
POST   /api/auth/reset-password              - Confirm password reset
POST   /api/auth/change-password             - Change current password
```

### Profile Endpoints (3)
```
GET    /api/profile/me                       - Get current user profile
GET    /api/profiles                         - Search profiles
POST   /api/profiles                         - Update profile
```

### Job Management Endpoints (12)
```
GET    /api/jobs                             - List jobs (with filters)
POST   /api/jobs                             - Create job
GET    /api/jobs/[id]                        - Get job details
PUT    /api/jobs/[id]                        - Update job
DELETE /api/jobs/[id]                        - Delete job
GET    /api/jobs/bookmarked                  - Get bookmarked jobs
POST   /api/jobs/[id]/like                   - Bookmark job
GET    /api/jobs/skills                      - Get job skill suggestions

GET    /api/companies/[id]/jobs              - List company jobs
POST   /api/companies/[id]/jobs              - Post new job
GET    /api/companies/[id]/jobs/[jobId]      - Get job details
PUT    /api/companies/[id]/jobs/[jobId]      - Update job
DELETE /api/companies/[id]/jobs/[jobId]      - Delete job
```

### Job Application Endpoints (10)
```
GET    /api/applications                     - List applications
POST   /api/applications                     - Submit application
GET    /api/applications/[id]                - Get application details
PUT    /api/applications/[id]                - Update application status
DELETE /api/applications/[id]                - Cancel application
GET    /api/applications/check-status        - Check application status

GET    /api/companies/[id]/jobs/[jobId]/applications
POST   /api/companies/[id]/jobs/[jobId]/applications
PUT    /api/companies/[id]/jobs/[jobId]/applications/[applicationId]
DELETE /api/companies/[id]/jobs/[jobId]/applications/[applicationId]
```

### Course Management Endpoints (28)
```
GET    /api/courses                          - List courses
POST   /api/courses                          - Create course
GET    /api/courses/[id]                     - Get course details
PUT    /api/courses/[id]                     - Update course
DELETE /api/courses/[id]                     - Delete course
GET    /api/courses/categories               - Get course categories

POST   /api/courses/[id]/enroll              - Enroll in course
GET    /api/courses/[id]/progress            - Get course progress
GET    /api/courses/[id]/modules             - List modules
POST   /api/courses/[id]/modules             - Create module
GET    /api/courses/[id]/modules/[moduleId]  - Get module details
PUT    /api/courses/[id]/modules/[moduleId]  - Update module
DELETE /api/courses/[id]/modules/[moduleId]  - Delete module

POST   /api/courses/[id]/modules/[moduleId]/lessons
GET    /api/courses/[id]/modules/[moduleId]/lessons
GET    /api/courses/[id]/modules/[moduleId]/lessons/[lessonId]
PUT    /api/courses/[id]/modules/[moduleId]/lessons/[lessonId]
DELETE /api/courses/[id]/modules/[moduleId]/lessons/[lessonId]

GET    /api/courses/[id]/lessons             - All course lessons
GET    /api/courses/[id]/lessons/[lessonId]/access
GET    /api/courses/[id]/lessons/[lessonId]/quiz
GET    /api/lessons/[id]/progress            - Lesson progress

GET    /api/courses/[id]/quizzes             - List quizzes
POST   /api/courses/[id]/quizzes             - Create quiz
GET    /api/courses/[id]/quizzes/[quizId]    - Get quiz details
PUT    /api/courses/[id]/quizzes/[quizId]    - Update quiz
DELETE /api/courses/[id]/quizzes/[quizId]    - Delete quiz
POST   /api/courses/[id]/quizzes/[quizId]/submit - Submit quiz attempt

GET    /api/courses/[id]/certificate        - Get certificate
GET    /api/public/courses                   - Public course list
```

### Course Analytics Endpoints (2)
```
GET    /api/courses/analytics                - Course analytics
GET    /api/courses/analytics/reports        - Detailed reports
```

### Institution Endpoints (18)
```
GET    /api/institutions                     - List institutions
POST   /api/institutions                     - Create institution
GET    /api/institutions/[id]                - Get institution details
PUT    /api/institutions/[id]                - Update institution
DELETE /api/institutions/[id]                - Delete institution

GET    /api/institutions/[id]/details        - Institution details
GET    /api/institutions/[id]/analytics      - Analytics dashboard
GET    /api/institutions/[id]/reports        - Generate reports

GET    /api/institutions/[id]/students       - List enrolled students
GET    /api/institutions/[id]/students/[studentId]
PUT    /api/institutions/[id]/students/[studentId]
DELETE /api/institutions/[id]/students/[studentId]

GET    /api/institutions/[id]/courses        - Institution courses
POST   /api/institutions/[id]/courses        - Create course
GET    /api/institutions/[id]/courses/[courseId]
PUT    /api/institutions/[id]/courses/[courseId]
DELETE /api/institutions/[id]/courses/[courseId]

GET    /api/institutions/[id]/enrollments    - Enrollments
GET    /api/institutions/[id]/enrollments/[enrollmentId]
PUT    /api/institutions/[id]/enrollments/[enrollmentId]
DELETE /api/institutions/[id]/enrollments/[enrollmentId]

GET    /api/institutions/by-user/[userId]   - User institutions
```

### Company Management Endpoints (18)
```
GET    /api/companies                        - List companies
POST   /api/companies                        - Create company
GET    /api/companies/[id]                   - Get company details
PUT    /api/companies/[id]                   - Update company
DELETE /api/companies/[id]                   - Delete company

GET    /api/companies/[id]/details           - Company information
GET    /api/companies/[id]/analytics         - Company hiring analytics
GET    /api/companies/[id]/hiring-metrics    - Hiring metrics
GET    /api/companies/[id]/applications      - Company applications
GET    /api/companies/[id]/employees         - Employee roster
POST   /api/companies/[id]/employees         - Add employee
GET    /api/companies/[id]/employees/[employeeId]
PUT    /api/companies/[id]/employees/[employeeId]
DELETE /api/companies/[id]/employees/[employeeId]

GET    /api/companies/by-user/[userId]       - User companies
GET    /api/company/info                     - Current company info
GET    /api/company/analytics                - Current company analytics
GET    /api/company/stats                    - Current company stats
GET    /api/company/applications             - Current company applications
GET    /api/public/jobs                      - Public job listings
```

### Entrepreneurship Endpoints (14)
```
GET    /api/entrepreneurship/entrepreneurships      - List businesses
POST   /api/entrepreneurship/entrepreneurships      - Create business
GET    /api/entrepreneurship/entrepreneurships/[id] - Get business details
PUT    /api/entrepreneurship/entrepreneurships/[id] - Update business
DELETE /api/entrepreneurship/entrepreneurships/[id] - Delete business

GET    /api/entrepreneurship/my-entrepreneurships   - User businesses
GET    /api/public/entrepreneurships                - Public businesses

GET    /api/entrepreneurship/posts                  - List posts
POST   /api/entrepreneurship/posts                  - Create post
GET    /api/entrepreneurship/posts/[id]             - Get post
PUT    /api/entrepreneurship/posts/[id]             - Update post
DELETE /api/entrepreneurship/posts/[id]             - Delete post
POST   /api/entrepreneurship/posts/[id]/like        - Like post
GET    /api/entrepreneurship/posts/[id]/comments    - Get comments
POST   /api/entrepreneurship/posts/[id]/comments    - Add comment
POST   /api/entrepreneurship/posts/[id]/share       - Share post

GET    /api/entrepreneurship/connections           - Get connections
POST   /api/entrepreneurship/connections           - Request connection
GET    /api/entrepreneurship/connections/[id]      - Get connection
PUT    /api/entrepreneurship/connections/[id]      - Accept/reject
DELETE /api/entrepreneurship/connections/[id]      - Delete connection

GET    /api/entrepreneurship/users                  - Find users
GET    /api/entrepreneurship/resources              - Resources
POST   /api/entrepreneurship/resources              - Create resource
GET    /api/entrepreneurship/news                   - News feed
```

### Youth Application Endpoints (8)
```
GET    /api/youth-applications                     - List applications
POST   /api/youth-applications                     - Create application
GET    /api/youth-applications/[id]                - Get application
PUT    /api/youth-applications/[id]                - Update application
DELETE /api/youth-applications/[id]                - Delete application

GET    /api/youth-applications/[id]/interests      - Company interests
POST   /api/youth-applications/[id]/interests      - Add interest
PUT    /api/youth-applications/[id]/interests/[interestId]
DELETE /api/youth-applications/[id]/interests/[interestId]
```

### Messaging Endpoints (4)
```
GET    /api/messages                         - Get messages
POST   /api/messages                         - Send message
GET    /api/messages/[id]                    - Get message
DELETE /api/messages/[id]                    - Delete message
GET    /api/messages/conversations           - Get conversations
GET    /api/interviews/[id]/messages         - Interview messages
POST   /api/interviews/[id]/messages         - Add interview message
```

### Certificate Endpoints (5)
```
GET    /api/certificates                     - List certificates
POST   /api/certificates                     - Create certificate
GET    /api/certificates/[id]                - Get certificate
POST   /api/certificates/generate            - Generate certificate
GET    /api/certificates/[id]/download       - Download PDF
```

### File Management Endpoints (9)
```
POST   /api/files/upload                     - Upload file
POST   /api/files/chunked-upload             - Start chunked upload
POST   /api/files/finalize-upload            - Finish chunked upload
GET    /api/files/minio/presigned            - Get presigned URL
POST   /api/files/minio/upload               - MinIO upload
GET    /api/files/minio/status               - Storage status
POST   /api/files/minio/upload-from-url      - Upload from URL
GET    /api/files/minio/init                 - Initialize buckets
GET    /api/images/proxy                     - Image proxy
POST   /api/cv/upload                        - CV upload
POST   /api/cover-letter/upload              - Cover letter upload
```

### Search Endpoints (3)
```
GET    /api/search                           - Global search
GET    /api/search/suggestions               - Search suggestions
GET    /api/search/popular                   - Popular searches
```

### Analytics Endpoints (6)
```
GET    /api/analytics                        - Global analytics
GET    /api/profiles/analytics               - Profile analytics
GET    /api/instructor/analytics             - Instructor analytics
GET    /api/youth/stats                      - Youth statistics
GET    /api/admin/stats                      - Admin statistics
```

### Admin Endpoints (13)
```
GET    /api/admin/users                      - List users
POST   /api/admin/users                      - Create user
GET    /api/admin/users/[id]                 - Get user
PUT    /api/admin/users/[id]                 - Update user
DELETE /api/admin/users/[id]                 - Delete user

GET    /api/admin/companies                  - List companies
GET    /api/admin/pending-companies          - Pending approvals
POST   /api/admin/pending-companies/[id]/approve
POST   /api/admin/pending-companies/[id]/reject
GET    /api/admin/institutions               - List institutions
GET    /api/admin/pending-institutions       - Pending approvals
POST   /api/admin/pending-institutions/[id]/approve
POST   /api/admin/pending-institutions/[id]/reject
```

### Resource Endpoints (3)
```
GET    /api/resources                        - List resources
POST   /api/resources                        - Create resource
GET    /api/resources/[id]                   - Get resource
PUT    /api/resources/[id]                   - Update resource
DELETE /api/resources/[id]                   - Delete resource
```

### Quiz Endpoints (4)
```
GET    /api/quizzes                          - List quizzes
POST   /api/quizzes                          - Create quiz
GET    /api/quizzes/[id]/attempts            - Get attempts
POST   /api/quizzes/[id]/attempts            - Submit attempt
```

### News Endpoints (4)
```
GET    /api/news                             - List news
POST   /api/news                             - Create news article
GET    /api/news/[id]                        - Get article
PUT    /api/news/[id]                        - Update article
DELETE /api/news/[id]                        - Delete article
```

### Business Plans Endpoints (4)
```
GET    /api/business-plans                   - List plans
POST   /api/business-plans                   - Create plan
GET    /api/business-plans/[id]              - Get plan
PUT    /api/business-plans/[id]              - Update plan
DELETE /api/business-plans/[id]              - Delete plan
```

### Other Endpoints (10+)
```
GET    /api/health                           - Health check
POST   /api/init                             - Initialize system
GET    /api/candidates                       - List candidates
GET    /api/candidates/[id]                  - Get candidate
GET    /api/municipalities                   - List municipalities
POST   /api/discussions                      - Create discussion
GET    /api/discussions                      - List discussions
POST   /api/discussions/[id]/replies         - Add reply
POST   /api/votes                            - Create vote
GET    /api/questions                        - List questions
```

---

## 6. AUTHENTICATION & SECURITY

### Authentication System
- **Provider**: NextAuth.js 4.24.11
- **Strategy**: JWT (JSON Web Tokens)
- **Method**: Credential-based (email/password)
- **Session Duration**: Configurable
- **Token Refresh**: Automatic via refresh tokens

### Authentication Flow
```
1. User submits email + password to /api/auth/register or sign-in
2. POST /api/auth/[...nextauth] validates credentials
3. Password verified using bcrypt (12 rounds)
4. User role determined (YOUTH, COMPANIES, INSTITUTION)
5. JWT token created with user metadata
6. Session established via NextAuth.js
7. Token stored in HTTP-only cookie (secure)
8. Subsequent requests include token in Authorization header
```

### Role-Based Access Control (RBAC)
Four user roles with specific permissions:

**YOUTH** - Individual job seekers
- Browse jobs, apply to positions
- Create open applications
- Take courses, earn certificates
- Build entrepreneurships
- Access profiles, send messages

**COMPANIES** - Hiring organizations
- Post job offerings
- Browse applicant profiles
- Manage applications
- Browse youth open applications
- Manage company profile & employees

**INSTITUTION** - Educational organizations
- Create & manage courses
- Manage students & enrollments
- Track progress & generate reports
- Approve youth registrations
- Access institutional analytics

**SUPERADMIN** - Platform administrators
- Manage all users
- Approve/reject companies & institutions
- Access global analytics
- System configuration
- Audit logs & security

### Route Protection
Middleware enforces role-based access:
```typescript
/dashboard        → YOUTH, COMPANIES, INSTITUTION, SUPERADMIN
/profile          → YOUTH, COMPANIES, INSTITUTION, SUPERADMIN
/jobs             → YOUTH, COMPANIES, INSTITUTION, SUPERADMIN
/applications     → YOUTH
/courses          → YOUTH, INSTITUTION, SUPERADMIN
/entrepreneurship → YOUTH, SUPERADMIN
/company          → COMPANIES, SUPERADMIN
/institution      → INSTITUTION, SUPERADMIN
/admin            → SUPERADMIN, INSTITUTION
```

### Password Security
- **Hashing**: bcryptjs with 12 salt rounds
- **Validation**: Min 6 characters, complexity checks
- **Reset**: Token-based password reset flow
- **Change**: Current password verification required

### Rate Limiting
- **Login Protection**: Configurable attempts (typically 5 failed = 15 min lockout)
- **API Protection**: Optional rate limiting per endpoint
- **Implementation**: In-memory rate limiter with IP tracking

### Additional Security Measures
- **CSRF Protection**: Built-in to NextAuth.js
- **XSS Prevention**: React auto-escaping + DOMPurify
- **SQL Injection**: Protected by Prisma ORM
- **CORS**: Configured for same-origin
- **Headers**: CSP, X-Frame-Options, HSTS, etc.
- **Environment**: Secrets stored in .env (not in version control)
- **Logging**: Security events logged with timestamps & IPs

### Data Protection
- **Transmission**: HTTPS/TLS in production
- **Storage**: Passwords hashed, sensitive data encrypted where needed
- **File Upload**: Type validation, malware scanning via MinIO
- **API Keys**: Not exposed in frontend code

---

## 7. FRONTEND COMPONENTS STRUCTURE

### Component Organization (25 Categories)

#### 1. Analytics Components (`/components/analytics/`)
- Dashboard charts and metrics
- Engagement tracking visualization
- Report generation

#### 2. Authentication UI (`/components/auth/`)
- Login form
- Registration form
- Password reset forms
- Email verification

#### 3. Profile Components (`/components/profile/`) - 13 files
**Key Components**:
- `ProfileForm.tsx` - Edit profile information
- `ProfileImageUpload.tsx` - Avatar management
- `ProfileCompletion.tsx` - Progress indicator
- `ProfileSearchFilters.tsx` - Filter profiles
- `SkillsAssessment.tsx` - Skills evaluation
- `ResumeBuilder.tsx` - CV creation
- `CoverLetterBuilder.tsx` - Cover letter editor
- `ProfileFileUpload.tsx` - Document upload
- `ProfileVerification.tsx` - Identity verification
- `InstitutionSection.tsx` - Institution selection
- `CompanySection.tsx` - Company affiliation
- `UserPreferences.tsx` - Settings

#### 4. CV Builder Components (`/components/cv-builder/`)
**Key Component**: `ProfileInformationTab.tsx` (1,479 lines)
- Most comprehensive component in project
- Education history management
- Work experience builder
- Skills & certifications
- Languages & projects
- Contact information
- Social links management

#### 5. Courses Components (`/components/courses/`)
**Largest Section**: Multiple complex components
- `UnifiedCourseManager.tsx` (1,058 lines) - Main course management
- `QuizManager.tsx` (896 lines) - Quiz creation & editing
- `LessonManager.tsx` (812 lines) - Lesson management
- `LessonViewer.tsx` (752 lines) - Lesson display
- `CourseCard.tsx` (718 lines) - Course preview card
- `QuizQuestionEditor.tsx` (689 lines) - Question builder

**All Course Components**:
- Course creation & editing
- Module management
- Lesson viewer with video player
- Quiz creation with multiple question types
- Progress tracking UI
- Certificate display
- Enrollment UI
- Course search & filtering

#### 6. Entrepreneurship Components (`/components/entrepreneurship/`) - 43 files
**Key Components**:
- `BusinessPlanBuilder.tsx` (1,326 lines) - Business plan editor
- `BusinessModelCanvas.tsx` - Business model visualization
- `TripleImpactAnalysis.tsx` - Impact assessment tool
- `FinancialCalculator.tsx` - Financial projections
- `FinancialCharts.tsx` - Charts & graphs
- `BusinessPlanPDF.tsx` - PDF export
- `CreatePostForm.tsx` - Social post editor
- `EnhancedPostCard.tsx` - Post display with engagement
- `EntrepreneurshipFilters.tsx` - Advanced search
- `EntrepreneurshipGrid.tsx` - Grid layout
- `MyEntrepreneurshipsGrid.tsx` - User businesses
- `CreateEntrepreneurshipModal.tsx` (668 lines)
- `ConnectionRequestModal.tsx` - Networking UI
- `ConnectionActions.tsx` - Connection management
- `ConnectionStatusBadge.tsx` - Status indicator
- `ConnectionNotifications.tsx` - Notification center
- `PostShareModal.tsx` - Sharing interface
- `PostInteractions.tsx` - Likes, comments, shares
- `NewsCard.tsx` - News display
- `ResourceCard.tsx` - Resource preview
- `UserCard.tsx` - User profile card
- `PDFExportButton.tsx` - Export functionality

#### 7. Job Management Components (`/components/jobs/`)
- `JobPostingForm.tsx` (761 lines) - Create/edit jobs
- Job search & filtering
- Application form
- Application management
- Candidate browsing
- Job details view
- Application status tracker

#### 8. Company Components (`/components/companies/`) & (`/components/company/`)
- `YouthApplicationBrowser.tsx` (873 lines) - Browse youth apps
- `CompanyProfileForm.tsx` (606 lines) - Company info editing
- Company profile display
- Employee management
- Hiring analytics
- Job posting dashboard

#### 9. Dashboard Components (`/components/dashboard/`)
- `YouthDashboard.tsx` - Student dashboard (24.7 KB)
- `CompanyDashboard.tsx` (16,483 bytes) - Employer dashboard
- `InstitutionDashboard.tsx` (11,670 bytes) - School dashboard
- `AdminDashboard.tsx` (9,163 bytes) - Admin panel
- `DashboardHeader.tsx` - Common header
- `StatsCards.tsx` - Metrics display
- `RecentActivity.tsx` - Activity feed
- `BreadcrumbNavigation.tsx` - Navigation
- `RoleBasedNavigation.tsx` - Role-specific menu

#### 10. Institution Components (`/components/institutions/`)
- `StudentManagementDashboard.tsx` (723 lines)
- Institution profile management
- Student enrollment & tracking
- Course management
- Analytics & reports

#### 11. Youth Applications (`/components/youth-applications/`)
- `YouthApplicationChatInterface.tsx` (602 lines) - Messaging UI
- Create/edit applications
- Interest tracking
- Company interaction interface

#### 12. Messaging Components (`/components/messaging/`)
- Chat interface
- Message threads
- Conversation list
- File attachments

#### 13. Candidates Components (`/components/candidates/`)
- `CandidateCard.tsx` - Profile preview
- `CandidateSearchFilters.tsx` - Advanced filtering
- Candidate listing
- Profile browsing

#### 14. Search Components (`/components/search/`)
- Search interface
- Filter options
- Result display
- Suggestions

#### 15. Resources Components (`/components/resources/`)
- Resource cards
- Resource library
- Download tracking
- Rating system

#### 16. News Components (`/components/news/`)
- News feed
- Article creation
- News cards
- Filtering

#### 17. Certificates Components (`/components/certificates/`)
- Certificate display
- PDF view
- Certificate tracking

#### 18. Files Components (`/components/files/`)
- File upload interface
- Chunked upload progress
- File browser

#### 19. Instructor Components (`/components/instructor/`)
- Instructor dashboard
- Course statistics
- Student progress

#### 20. Interviews Components (`/components/interviews/`)
- Interview scheduling
- Video call setup
- Interview feedback

#### 21. Interviews Components (`/components/interviews/`)
- Interview scheduling
- Video call setup
- Interview feedback

#### 22. Content Management (`/components/content/`)
- Content editor
- Content organization
- Publishing workflow

#### 23. Analytics Components (`/components/analytics/`)
- Dashboard charts
- Metrics visualization
- Report generation
- Export functionality

#### 24. UI Components (`/components/ui/`)
- Radix UI primitives (re-exports)
- Button, Card, Dialog, etc.
- Form components
- Layout components

#### 25. Header Component
- `LandingHeader.tsx` - Main navigation
- Logo & branding
- User menu
- Mobile responsive

### Component Size Reference (Top 15)
1. ProfileInformationTab.tsx - 1,479 lines (CV Builder)
2. BusinessPlanBuilder.tsx - 1,326 lines (Entrepreneurship)
3. UnifiedCourseManager.tsx - 1,058 lines (Courses)
4. QuizManager.tsx - 896 lines (Courses)
5. YouthApplicationBrowser.tsx - 873 lines (Companies)
6. CourseCard.tsx - 718 lines (Courses)
7. QuizQuestionEditor.tsx - 689 lines (Courses)
8. CreateEntrepreneurshipModal.tsx - 668 lines (Entrepreneurship)
9. CompanyProfileForm.tsx - 606 lines (Companies)
10. YouthApplicationChatInterface.tsx - 602 lines (Youth Apps)
11. LessonManager.tsx - 812 lines (Courses)
12. LessonViewer.tsx - 752 lines (Courses)
13. StudentManagementDashboard.tsx - 723 lines (Institutions)
14. JobPostingForm.tsx - 761 lines (Jobs)
15. YouthDashboard.tsx - 24.7 KB (Dashboard)

---

## 8. KEY CONFIGURATION FILES

### Next.js Configuration (`next.config.ts`)
```typescript
- ESLint disabled during builds
- Server Actions with 600MB body limit
- Webpack configuration for MinIO
- Image domains & remote patterns
- Security headers (CSP, HSTS, etc.)
- Canvas support for PDF generation
```

### Tailwind Configuration (`tailwind.config.ts`)
```typescript
- Custom colors and theming
- Extended spacing & typography
- Animation utilities
- Animation plugin (tailwindcss-animate)
```

### TypeScript Configuration (`tsconfig.json`)
```typescript
- Target: ES2017
- Path alias: @/* → src/*
- Strict mode: disabled for flexibility
- Module resolution: bundler
- JSX preservation for Next.js
```

### Prisma Configuration (`prisma/schema.prisma`)
- PostgreSQL database
- 1,145 lines of schema
- 33+ models
- 15+ migrations
- Binary targets: native, linux-musl-arm64-openssl-3.0.x

### Environment Configuration (`.env`)
```
Database: PostgreSQL on localhost:5432
Redis: localhost:6379
MinIO: localhost:9000
App: localhost:3000
Auth: NextAuth with JWT
```

### Docker Compose (`docker-compose.yml`)
```yaml
Services:
  - PostgreSQL 15 (database)
  - Redis 7 (caching)
  - MinIO (object storage)
  - MinIO Client (bucket init)
  - Prisma Studio (optional)
Volumes:
  - db_data
  - redis_data
  - minio_data
Networks:
  - emplea-y-emprende-network
```

### Package.json Scripts (44 scripts)
**Development**:
- `dev` - Start dev server
- `build` - Build application
- `start` - Start production server
- `lint` - Run ESLint
- `test` - Run tests
- `clean` - Clear cache

**Database**:
- `db:migrate` - Run Prisma migrations
- `db:push` - Push schema changes
- `db:studio` - Open Prisma GUI
- `db:seed` - Seed database
- `db:reset` - Reset database

**Docker**:
- `docker:up` - Start services
- `docker:down` - Stop services
- `docker:logs` - View logs
- `docker:clean` - Remove all

**Deployment**:
- `manage:start` - Start via systemd
- `manage:stop` - Stop service
- `update` - Pull & deploy

---

## 9. CUSTOM REACT HOOKS (48 Total)

### Data Fetching Hooks
- `useCourses()` - Course list & management
- `useJobs()` - Job listings & details
- `useApplications()` - Job applications
- `useProfiles()` - User profiles
- `useCandidates()` - Candidate search
- `useEntrepreneurships()` - Business listings

### Management Hooks
- `useCompanies()` - Company management
- `useInstitutionAnalytics()` - Institution metrics
- `useInstitutionStudents()` - Student management
- `useCompanyAnalytics()` - Company hiring metrics
- `useDiscussions()` - Discussion threads
- `useNews()` - News feed

### Feature Hooks
- `useCourseAnalytics()` - Course performance
- `useCourseProgress()` - Student progress
- `useYouthApplications()` - Youth app management
- `useEntrepreneurshipConnections()` - Networking
- `useMessages()` - Messaging
- `useResources()` - Resource library
- `useQuizzes()` - Quiz management
- `useInterviews()` - Interview system
- `useCertificates()` - Certificate tracking

### Upload & File Hooks
- `useChunkedUpload()` - Large file uploads
- `useFileUpload()` - File management
- `useMinIO()` - MinIO integration
- `useProfileFiles()` - Profile documents
- `useCVData()` - CV data management

### Utility Hooks
- `useDebounce()` - Search debouncing
- `useSearch()` - Global search
- `useRoleAccess()` - Permission checking
- `useAdminStats()` - Admin dashboard
- `useYouthStats()` - Youth statistics
- `useCompanyId()` - Company ID context
- `useInstitutionId()` - Institution ID context
- `useJobSkills()` - Job skill filtering
- `useMunicipalities()` - Location data
- `useBookmarkedJobs()` - Bookmarks
- `useBusinessPlans()` - Business plans
- `useHybridJobs()` - Combined job data
- `useHybridResources()` - Resource aggregation
- `useCompleteProfile()` - Profile completion
- `useJobApplicationStatus()` - Application status
- `useCourseCreation()` - Course creation
- `useLessonAccess()` - Lesson permissions
- `useCompanyApplications()` - Company applications
- `useCompanyStats()` - Company statistics
- `useEntrepreneurshipNews()` - News feed
- `useEntrepreneurshipPosts()` - Social posts
- `useEntrepreneurshipResources()` - Business resources
- `useInstructorDashboard()` - Teaching interface

---

## 10. DEPLOYMENT & INFRASTRUCTURE

### Development Environment
- **OS**: Ubuntu 24.04 LTS, Amazon Linux 2023
- **Runtime**: Node.js 20+
- **Package Manager**: pnpm 8.x
- **Database**: PostgreSQL 15 (Docker)
- **Cache**: Redis 7 (Docker)
- **Storage**: MinIO (Docker)

### Deployment Architecture
```
┌─────────────────────────────────────┐
│   Nginx / Reverse Proxy             │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│  Next.js App │  │  API Routes   │
│ (pnpm start) │  │  (server-side)│
└────────┬─────┘  └───────┬───────┘
         │                │
    ┌────▼────────────────▼─────┐
    │     Backend Services      │
    │  (Docker Containers)      │
    ├──────────────────────────┤
    │ • PostgreSQL 15          │
    │ • Redis 7                │
    │ • MinIO (S3-compatible)  │
    └──────────────────────────┘
```

### Key Infrastructure Scripts
- `setup.sh` / `setup-ubuntu.sh` - Initial server setup
- `update.sh` - Git pull + migrations + restart
- `manage.sh` - Service management (start/stop/backup)
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Application container

### Service Management
- **Application**: systemd service `emplea-y-emprende.service`
- **Backend**: systemd service `emplea-y-emprende-backend.service`
- **Auto-restart**: Enabled for both services
- **Logging**: systemd journal (`journalctl`)

### Performance Optimizations
- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Redis for sessions & data
- **Database**: Indexes on frequently queried fields
- **API**: React Query for client-side caching
- **Compression**: gzip in Nginx
- **CDN Ready**: Works with CloudFlare or similar

### Database Migrations
- Prisma migrations stored in `/prisma/migrations/`
- Automatic execution on deployment
- Rollback capability via `prisma migrate resolve`
- Seeding scripts for test data

### Backup & Recovery
- Database: Regular backups via `manage.sh backup`
- Files: MinIO versioning enabled
- Disaster Recovery: Documented in DEPLOYMENT.md

---

## SUMMARY TABLE

| Component | Technology | Details |
|-----------|-----------|---------|
| **Framework** | Next.js 15 | React 19, App Router, Server Components |
| **Language** | TypeScript | Type-safe, strict mode flexible |
| **Database** | PostgreSQL 15 | Prisma ORM, 1,145 line schema |
| **Cache** | Redis 7 | Session & data caching |
| **Storage** | MinIO | S3-compatible, 6 buckets |
| **Auth** | NextAuth.js 4 | JWT, rate-limited |
| **UI Framework** | Tailwind CSS | Utility-first, custom theme |
| **UI Components** | Radix UI | Headless, accessible primitives |
| **Forms** | React Hook Form | Efficient, Zod validation |
| **Data Fetching** | React Query 5 | Server state management |
| **PDF Generation** | react-pdf | Canvas-based PDF creation |
| **Maps** | Leaflet + react-leaflet | Interactive mapping |
| **Icons** | Lucide React | 544+ icons |
| **Notifications** | Sonner | Toast notifications |
| **File Upload** | Busboy | Chunked uploads |
| **Testing** | Jest 30 | React Testing Library |
| **Code Quality** | ESLint 9 | Prettier formatting |
| **Container** | Docker | Multi-container orchestration |
| **Deployment** | Manual/Systemd | Server-based deployment |

---

## KEY ENDPOINTS BY FEATURE

| Feature | Count | Example Endpoints |
|---------|-------|------------------|
| **Authentication** | 5 | /api/auth/register, /api/auth/reset-password |
| **Jobs** | 12 | /api/jobs, /api/companies/[id]/jobs |
| **Courses** | 28 | /api/courses, /api/courses/[id]/modules |
| **Institutions** | 18 | /api/institutions, /api/institutions/[id]/students |
| **Companies** | 18 | /api/companies, /api/companies/[id]/analytics |
| **Entrepreneurship** | 14 | /api/entrepreneurship/posts, /api/entrepreneurship/connections |
| **Youth Apps** | 8 | /api/youth-applications, /api/youth-applications/[id]/interests |
| **Messaging** | 4 | /api/messages, /api/messages/conversations |
| **Certificates** | 5 | /api/certificates, /api/certificates/generate |
| **Files** | 9 | /api/files/upload, /api/files/minio/status |
| **Search** | 3 | /api/search, /api/search/suggestions |
| **Analytics** | 6 | /api/analytics, /api/courses/analytics |
| **Admin** | 13 | /api/admin/users, /api/admin/pending-companies |
| **Profiles** | 3 | /api/profile/me, /api/profiles |
| **Others** | 9 | /api/health, /api/news, /api/resources |
| **TOTAL** | **151** | Comprehensive API coverage |

---

## NOTABLE FEATURES & IMPLEMENTATION DETAILS

### 1. **Unified Messaging System**
- Context-aware (Job, Youth, Entrepreneurship, General)
- Profile relations for sender/recipient
- Support for attachments
- Read status tracking

### 2. **Business Plan Builder**
- Business Model Canvas
- Triple Impact Assessment
- Financial Projections
- PDF export
- Completion percentage tracking

### 3. **Comprehensive Analytics**
- Course completion rates
- Job application funnels
- Hiring metrics
- User engagement tracking
- Institutional dashboards

### 4. **Multi-role Role-Based Access**
- 4 distinct user roles
- Route-level protection
- API-level authorization
- Context-based features

### 5. **Advanced Course Management**
- Modular structure (Course → Module → Lesson)
- Multiple content types (Video, Audio, Text, Quiz, etc.)
- Progress tracking per lesson
- Module & course certificates
- Quiz with attempts & scoring

### 6. **Entrepreneurship Ecosystem**
- Business registration
- Social networking (connections/requests)
- Post creation with engagement (likes, comments)
- Resource library
- News feed

### 7. **Dual Application Systems**
- **Job Applications**: Companies post, Youth apply
- **Youth Applications**: Youth post profile, Companies express interest

### 8. **Institutional Integration**
- Institution dashboard
- Student roster management
- Course creation & management
- Analytics & reporting
- Approval workflows

### 9. **File Management**
- MinIO integration for S3-compatible storage
- Chunked uploads (600MB support)
- Multiple bucket types
- Presigned URLs for secure downloads
- Image optimization

### 10. **Security Features**
- Bcryptjs password hashing (12 rounds)
- JWT token-based authentication
- Rate limiting on login
- CSRF protection
- Security logging
- XSS prevention with DOMPurify

---

This technical overview provides a comprehensive understanding of the **Emplea y Emprende** platform's architecture, databases, features, and implementation details. The project is well-structured, scalable, and ready for production deployment with proper security and performance considerations.
