# Emplea y Emprende - Quick Reference Guide

## Key Facts At A Glance

**Project**: Youth Employability & Entrepreneurship Platform  
**Language**: Spanish (Frontend) / English (Backend)  
**Framework**: Next.js 15 + React 19 + TypeScript  
**Database**: PostgreSQL 15 + Prisma ORM  
**Storage**: MinIO (S3-compatible)  
**Auth**: NextAuth.js with JWT  
**API Endpoints**: 151 total  
**React Components**: 200+ across 25 directories  
**Custom Hooks**: 48 total  
**Database Models**: 33+ Prisma models  

---

## User Roles & Capabilities

| Role | Dashboard | Can Create | Can Manage |
|------|-----------|-----------|----------|
| **YOUTH** | `/dashboard` | Jobs applications, Profiles, Entrepreneurships, Open applications | Own courses enrollment, CV, Portfolio |
| **COMPANIES** | `/dashboard` | Job postings, Employee records | Company profile, Hiring metrics, Applications |
| **INSTITUTION** | `/dashboard` | Courses, Student enrollment | Institution profile, Analytics, Certificates |
| **SUPERADMIN** | `/admin` | All entities | Approvals, Users, System config |

---

## Main Features Summary

### 1. Job Management
- **Create/Post**: Companies post jobs
- **Apply**: Youth apply with CV + cover letter
- **Custom Questions**: Companies add screening questions
- **Status Tracking**: SENT → UNDER_REVIEW → PRE_SELECTED → HIRED/REJECTED
- **Messaging**: Chat after application

**Salary Support**: Min/Max with currency (default BOB)  
**Work Types**: Full-time, Part-time, Internship, Volunteer, Freelance  
**Modalities**: On-site, Remote, Hybrid  

### 2. Courses
- **Structure**: Course → Modules → Lessons → Quizzes
- **Content Types**: Video, Audio, Text, Quiz, Exercise, Document, Interactive
- **Categories**: 8 types (Soft Skills, Technical, Entrepreneurship, etc.)
- **Levels**: Beginner, Intermediate, Advanced
- **Certificates**: Auto-generated on completion

### 3. Entrepreneurship Hub
- **Business Profiles**: Create & manage businesses
- **Business Plans**: Builder with Business Model Canvas + Financial Projections
- **Networking**: Send/receive connection requests
- **Social Feed**: Posts with likes, comments, shares
- **Resources**: Curated knowledge base

### 4. Youth Applications
- **Self-Promotion**: Youth create open applications
- **Company Interest**: Companies browse & mark interest
- **Messaging**: Enabled upon interest

### 5. Institution Management
- **Multi-Tenant**: Support for multiple institutions
- **Course Creation**: Full course management
- **Student Tracking**: Enrollment, progress, analytics
- **Approvals**: Workflow for institution verification

### 6. Messaging System
- **Context-Aware**: Job, Youth App, Entrepreneurship, General
- **File Attachments**: Support for documents
- **Read Status**: Track message reads

---

## Core API Routes (By Category)

### Authentication (5)
```
POST /api/auth/register
POST /api/auth/[...nextauth]
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/change-password
```

### Jobs (12)
```
GET/POST   /api/jobs
GET/PUT    /api/jobs/[id]
POST       /api/applications
GET        /api/companies/[id]/jobs
POST/GET   /api/candidates
```

### Courses (28)
```
GET/POST   /api/courses
POST       /api/courses/[id]/enroll
GET        /api/courses/[id]/progress
GET/POST   /api/courses/[id]/modules/[moduleId]/lessons
POST       /api/quizzes/[id]/attempts
GET        /api/certificates
```

### Institutions (18)
```
GET/POST   /api/institutions
GET        /api/institutions/[id]/students
GET        /api/institutions/[id]/courses
GET        /api/institutions/[id]/analytics
```

### Companies (18)
```
GET/POST   /api/companies
GET        /api/companies/[id]/hiring-metrics
GET        /api/companies/[id]/analytics
POST       /api/companies/[id]/employees
```

### Entrepreneurship (14)
```
GET/POST   /api/entrepreneurship/entrepreneurships
GET/POST   /api/entrepreneurship/posts
POST       /api/entrepreneurship/posts/[id]/like
GET/POST   /api/entrepreneurship/connections
GET        /api/entrepreneurship/resources
```

### Youth Apps (8)
```
GET/POST   /api/youth-applications
POST       /api/youth-applications/[id]/interests
```

### Files (9)
```
POST       /api/files/upload
POST       /api/files/chunked-upload
GET        /api/files/minio/presigned
```

### Other Categories
- **Messages**: 4 endpoints
- **Search**: 3 endpoints
- **Analytics**: 6 endpoints
- **Admin**: 13 endpoints
- **Resources**: 3 endpoints
- **Certificates**: 5 endpoints
- **Misc**: 15+ endpoints

**Total**: 151 API endpoints

---

## Database Schema Highlights

### Key Models
1. **User** - Authentication & role management
2. **Profile** - User detailed information
3. **Course** - Learning content
4. **CourseModule** - Course sections
5. **Lesson** - Individual course content
6. **JobOffer** - Job postings
7. **JobApplication** - Job applications with status tracking
8. **Company** - Employer organizations
9. **Institution** - Educational organizations
10. **Entrepreneurship** - Business profiles
11. **BusinessPlan** - Business planning tool
12. **Message** - Context-aware messaging
13. **Certificate** - Course completion credentials

### Database Features
- PostgreSQL 15 with Prisma ORM
- 33+ models with complex relationships
- Indexes on frequently queried fields
- Unique constraints for data integrity
- Enums for type safety
- JSON fields for flexible data storage
- 15+ migrations in production

---

## Technology Versions

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.1.7 | Web framework |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| PostgreSQL | 15 | Database |
| Prisma | 6.16.1 | ORM |
| NextAuth.js | 4.24.11 | Authentication |
| Tailwind CSS | 3.4.1 | Styling |
| React Query | 5.87.4 | Data fetching |
| Radix UI | Latest | UI components |
| Zod | 4.1.8 | Validation |
| MinIO | 8.0.6 | File storage |

---

## Component Structure

### Largest Components
1. **ProfileInformationTab.tsx** - 1,479 lines (CV Builder)
2. **BusinessPlanBuilder.tsx** - 1,326 lines (Entrepreneurship)
3. **UnifiedCourseManager.tsx** - 1,058 lines (Courses)
4. **QuizManager.tsx** - 896 lines (Courses)
5. **YouthApplicationBrowser.tsx** - 873 lines (Companies)

### Component Categories (25 total)
- **Dashboard**: 11 files (main dashboards)
- **Courses**: 15+ files (largest section)
- **Entrepreneurship**: 43 files (most files)
- **Profile**: 13 files
- **Companies**: 2 directories
- **Jobs**: Multiple files
- **Institutions**: Admin & management
- **Youth Applications**: Dedicated UI
- **Messaging**: Chat interface
- **Analytics**: Charts & metrics

---

## Custom Hooks (48 Total)

### Data Fetching
- `useCourses()`, `useJobs()`, `useApplications()`, `useProfiles()`, `useCandidates()`

### Management
- `useCompanies()`, `useInstitutionAnalytics()`, `useInstitutionStudents()`

### Features
- `useMessages()`, `useResources()`, `useQuizzes()`, `useInterviews()`

### Uploads
- `useChunkedUpload()`, `useFileUpload()`, `useMinIO()`

### Utilities
- `useDebounce()`, `useSearch()`, `useRoleAccess()`

---

## Configuration Files

### Key Configs
- **next.config.ts** - Next.js settings, image domains, security headers
- **tailwind.config.ts** - CSS theming & utilities
- **tsconfig.json** - TypeScript compiler options
- **prisma/schema.prisma** - Database schema (1,145 lines)
- **docker-compose.yml** - Infrastructure services
- **.env** - Environment variables

### Service Configuration
- **Database**: PostgreSQL on port 5432
- **Cache**: Redis on port 6379
- **Storage**: MinIO on port 9000 (admin on 9001)
- **App**: Next.js on port 3000
- **Prisma Studio**: Optional on port 5555

---

## Development Workflow

### Setup
```bash
pnpm install
cp env.template .env
pnpm run docker:up
pnpm run db:seed
pnpm run dev
```

### Common Commands
```bash
# Development
pnpm run dev                    # Start app
pnpm run docker:up             # Start services
pnpm run docker:logs           # View logs

# Database
pnpm run db:migrate            # Run migrations
pnpm run db:studio             # Prisma GUI
pnpm run db:seed               # Add test data

# Testing
pnpm run test                  # Run tests
pnpm run test:coverage         # Coverage report

# Deployment
pnpm run build                 # Build for production
pnpm run start                 # Production start
```

---

## Deployment

### Production Architecture
```
Nginx (reverse proxy)
    ↓
Next.js app (pnpm start)
    ↓
API Routes + Database
    ↓
PostgreSQL + Redis + MinIO
```

### Deployment Scripts
- **setup.sh** / **setup-ubuntu.sh** - Initial server setup
- **update.sh** - Pull, migrate, restart (one command)
- **manage.sh** - Service management (start/stop/backup)

### Service Management
```bash
./manage.sh start              # Start services
./manage.sh stop               # Stop services
./manage.sh restart            # Restart
./manage.sh health             # Health check
./manage.sh backup             # Create backup
./manage.sh logs               # View logs
```

---

## Security Features

- **Passwords**: bcryptjs (12 rounds)
- **Sessions**: JWT via NextAuth.js
- **Rate Limiting**: Login attempt limiting
- **CSRF**: Built-in NextAuth.js protection
- **XSS**: React escaping + DOMPurify
- **SQL Injection**: Protected by Prisma ORM
- **Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Validation**: Zod schemas on all inputs

---

## Performance Optimizations

- **Code Splitting**: Automatic via Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: Redis for sessions & data
- **Database Indexes**: On FK, status, timestamps
- **React Query**: Client-side caching & sync
- **Lazy Loading**: Dynamic imports
- **Compression**: gzip in production

---

## Key Directories Reference

```
/src/app                    → Pages & API routes
/src/components             → React components (200+)
/src/hooks                  → Custom hooks (48)
/src/lib                    → Services & utilities
/src/types                  → TypeScript definitions
/prisma                     → Database schema & migrations
/public                     → Static assets
/docs                       → Documentation
```

---

## Important Notes

1. **Language Separation**: 
   - Frontend UI: Spanish
   - Backend code: English
   - Comments: English

2. **Role-Based Access**: Always check user role before rendering sensitive features

3. **Database Relations**: Use Prisma relations for efficient queries with `include()` and `select()`

4. **File Storage**: Use MinIO for all file uploads (max 600MB for Server Actions)

5. **Validation**: Use Zod schemas in API routes for input validation

6. **Authentication**: JWT tokens stored in HTTP-only cookies (secure)

---

## Useful Links

- **README.md** - Quick start guide
- **DEPLOYMENT.md** - Detailed deployment instructions
- **cemse.md** - Full project documentation
- **TECHNICAL_OVERVIEW.md** - This comprehensive guide

---

**Last Updated**: October 2024  
**Status**: Active Development  
**Next Phase**: Enhanced analytics, real-time features, mobile app
