"# CEMSE - Complete Educational and Employment Platform System

## System Overview

Create a modern full-stack web application using **Next.js 15.1.7** with **App Router**, designed as an educational, employment, and entrepreneurship platform for youth. The system manages 4 main roles with different access levels and specific functionalities.

## ⚠️ IMPORTANT - Development Rules

### Language and Localization

- **FRONTEND**: All user-visible content must be in **SPANISH**

  - Interface texts, descriptions, alerts, dialogs
  - Error and validation messages
  - Form placeholders
  - Button titles and labels
  - Mobile-optimized and responsive UI/UX
  - Notifications and tooltips

- **BACKEND**: All code must remain in **ENGLISH**
  - Variable, function, and class names
  - File and directory names
  - Code comments
  - Database table and field names
  - API endpoint names

### Code Standards

- Follow **ESLint rules** strictly for TypeScript
- Apply **Prettier** for consistent formatting
- Use **standard naming conventions**:
  - camelCase for variables and functions
  - PascalCase for components and classes
  - kebab-case for files and directories
  - UPPER_SNAKE_CASE for constants
- Implement **TypeScript strict mode**
- Apply **SOLID principles** and **DRY**
- Use **early returns** for better readability
- Implement **robust error handling**
- Apply **performance optimization** with React Query, lazy loading, memoization
- Use **scalability best practices** with modular and reusable code

## Main Technology Stack

### Frontend

- **Framework**: Next.js 15.1.7 with App Router
- **UI Library**: React 19.0.0 + shadcn/ui components
- **Styling**: TailwindCSS 3.4.17 with custom configuration
- **Icons**: Lucide React for all iconography
- **Forms**: react-hook-form 7.54.2 + zod 3.24.2 for validation
- **State Management**: Tanstack React Query 5.66.7 for server state
- **Animation**: Framer Motion 12.4.7 for animations
- **Maps**: Leaflet + React Leaflet for interactive maps
- **PDF Generation**: @react-pdf/renderer for certificates and CVs
- **File Upload**: React Dropzone for file uploads

### Backend

- **API**: Next.js API Routes (RESTful)
- **Database**: PostgreSQL with Prisma 6.4.0 as ORM
- **Authentication**: NextAuth.js 4.24.11 with JWT
- **File Storage**: MinIO for file storage
- **Caching**: Redis for data caching
- **Email**: Resend for transactional emails
- **Security**: bcrypt for password hashing, crypto-js for encryption
- **Video Processing**: FFmpeg for video conversion

## Detailed Role and Permission System

### 1. ADMIN (Super Administrator)

**Capabilities:**

- Create and manage all user types (edit, delete)
- Create and manage news, resources, courses, job offers
- View applications from YOUTH users
- Complete access to all system functionalities
- Manage institutions and companies
- System statistics and reports

### 2. INSTITUTION (Single role with 3 different types)

**All institution types share the same `INSTITUTION` role but are differentiated by the `institutionType` field:**

#### A. MUNICIPALITY (`InstitutionType.MUNICIPALITY`)

**Capabilities:**

- Create and manage news, resources, courses
- Create and manage companies, youth, and institutions (except other municipalities)
- Edit and delete created users
- Complete management of their jurisdiction

#### B. NGO (`InstitutionType.NGO`)

**Capabilities:**

- Create and manage companies
- Create and manage courses
- Create and manage news
- Educational resource management

#### C. TRAINING_CENTER (`InstitutionType.TRAINING_CENTER`)

**Capabilities:**

- Same as NGOs
- Specialized focus on courses and training

### 3. COMPANY

**Capabilities:**

- Create job offers with detailed information
- Create news and resources
- **Flow 1 - Job Offers:**
  - Publish offers with requirements, benefits, salary, etc.
  - Receive applications from youth
  - View complete candidate information (CV, cover letter, personal data)
  - Manage application status: Reviewing → Pre-selected → Hired/Rejected
  - Integrated chat with candidates during the process
- **Flow 2 - Open Applications:**
  - Explore open applications from youth
  - Mark interest in specific applications
  - States: Interested → Contacted → Interview Scheduled → Hired/Not Interested
  - Integrated chat with interested youth
- Manage hired employees (terminate, etc.)

### 4. YOUTH

**Capabilities:**

- **Employment System:**
  - View and apply for job offers
  - Create open applications (specific employment profile)
  - Chat with companies during selection processes
- **Content Exploration:**
  - View institutions and their profiles (courses, resources, news)
  - View companies and their profiles (offers, news, employees)
- **Course System:**
  - Enroll in courses
  - Progress through lessons with different content types
  - Quiz system with unlimited attempts
  - Automatic certificates upon course completion
- **Entrepreneurship System:**
  - Create entrepreneurship projects with detailed information
  - Network with other entrepreneurs
  - Chat between entrepreneurs
  - Specialized entrepreneurship resources and news
- **CV Builder:**
  - Build CV with 3 available templates
  - Generate cover letter with 3 templates
  - Automatic download to MinIO for quick reference
  - Integration with profile for applications

## Detailed Course System

### Hierarchical Structure

```
Course
├── Modules (ordered)
│   ├── Lessons (ordered)
│   │   ├── Content (Video/Audio/Text)
│   │   ├── Additional Resources (optional)
│   │   └── Quiz (optional)
│   └── Module Certificate (optional)
└── Course Certificate (optional)
```

### Learning Flow

1. **Enrollment**: Youth enrolls in the course
2. **Progress**: Must complete lessons in order
3. **Content**: Video, audio, or text depending on lesson type
4. **Resources**: Access to additional materials
5. **Quiz**: If exists, must pass to continue (unlimited attempts)
6. **Tracking**: Record of all attempts and responses
7. **Certification**: Automatic PDF certificate generation upon completion

## Chunked File Upload System

### Chunked Upload Implementation

```typescript
// Division of large files into small chunks
const CHUNK_SIZE = 1024 * 1024; // 1MB per chunk

export async function uploadFileInChunks(file: File) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = generateUploadId();

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    await uploadChunk(uploadId, i, chunk, totalChunks);
  }

  return await finalizeUpload(uploadId);
}
```

### Advantages of the Chunk System

- **Reliability**: If a chunk fails, only that fragment is resent
- **Progress**: Accurate progress bar
- **Memory**: Doesn't load complete files in memory
- **Network**: Better handling of slow connections
- **Server**: Lower server load

## Project Structure

### Directory Organization

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes (route group)
│   │   ├── sign-in/             # Login page
│   │   ├── sign-up/             # Registration page
│   │   ├── forgot-password/     # Password recovery
│   │   └── reset-password/      # Password reset
│   ├── (dashboard)/             # Dashboard routes (route group)
│   │   ├── admin/               # Administration panel
│   │   ├── company/             # Company panel
│   │   ├── courses/             # Course management
│   │   ├── jobs/                # Job offers
│   │   ├── entrepreneurship/    # Entrepreneurship
│   │   └── profile/             # User profile
│   ├── api/                     # API Routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── courses/             # Course endpoints
│   │   ├── jobs/                # Job endpoints
│   │   └── files/               # File endpoints
│   └── layout.tsx               # Main layout
├── components/                   # Reusable components
│   ├── ui/                      # shadcn/ui components
│   └── [domain]/                # Domain-specific components
├── hooks/                       # Custom React hooks
├── lib/                         # Utilities and configuration
│   ├── providers/               # Context providers
│   ├── auth.ts                  # Authentication configuration
│   └── prisma.ts                # Prisma client
├── services/                    # API services
├── types/                       # TypeScript definitions
└── context/                     # Context providers
```

## Authentication Configuration

### JWT System with NextAuth.js

```typescript
// Authentication configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Database validation
        // Returns user if valid
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Customize session data
    },
    async jwt({ token, user }) {
      // Customize JWT token
    },
  },
};
```

### User Roles

- **YOUTH**: Job-seeking youth
- **COMPANIES**: Companies that post job offers
- **INSTITUTION**: Institutions (municipalities, NGOs, training centers)
- **SUPERADMIN**: System administrator
- **INSTRUCTOR**: Course instructors

### Institution Types (within INSTITUTION role)

- **MUNICIPALITY**: Municipalities
- **NGO**: Non-Governmental Organizations
- **TRAINING_CENTER**: Training Centers
- **FOUNDATION**: Foundations
- **OTHER**: Other types of institutions

## Optimized Database Schema

### Main Models

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String         @id @default(cuid())
  email                 String         @unique
  password              String
  role                  UserRole
  isActive              Boolean        @default(true)
  refreshToken          String?
  refreshTokenExpires   DateTime?
  createdAt             DateTime       @default(now())
  updatedAt             DateTime       @updatedAt
  createdCompanies      Company[]      @relation("CompanyCreator")
  createdInstitutions   Institution[]  @relation("InstitutionCreator")
  createdMunicipalities Municipality[] @relation("MunicipalityCreator")
  profile               Profile?
  createdResources      Resource[]     @relation("ResourceCreator")

  @@index([role])
  @@index([isActive])
  @@map("users")
}

model Profile {
  id                        String              @id @default(cuid())
  userId                    String              @unique
  avatarUrl                 String?
  createdAt                 DateTime            @default(now())
  updatedAt                 DateTime            @updatedAt
  active                    Boolean             @default(true)
  status                    UserStatus          @default(ACTIVE)
  firstName                 String?
  lastName                  String?
  email                     String?
  phone                     String?
  address                   String?
  municipalityId            String?
  country                   String?             @default("Bolivia")
  birthDate                 DateTime?
  gender                    String?
  documentType              String?
  documentNumber            String?
  educationLevel            EducationLevel?
  currentInstitution        String?
  graduationYear            Int?
  isStudying                Boolean?
  skills                    Json?
  interests                 Json?
  socialLinks               Json?
  workExperience            Json?
  profileCompletion         Int                 @default(0)
  lastLoginAt               DateTime?
  parentalConsent           Boolean             @default(false)
  parentEmail               String?
  consentDate               DateTime?
  achievements              Json?
  addressLine               String?
  city                      String?
  state                     String?
  cityState                 String?
  professionalSummary       String?
  extracurricularActivities Json?
  jobTitle                  String?
  languages                 Json?
  projects                  Json?
  skillsWithLevel           Json?
  websites                  Json?
  coverLetterContent        String?
  coverLetterRecipient      Json?
  coverLetterSubject        String?
  coverLetterTemplate       String?             @default("professional")
  academicAchievements      Json?
  currentDegree             String?
  educationHistory          Json?
  gpa                       Float?
  universityEndDate         DateTime?
  universityName            String?
  universityStartDate       DateTime?
  universityStatus          String?
  targetPosition            String?
  targetCompany             String?
  relevantSkills            String[]

  // Campos para CV Builder
  cvUrl                     String?
  coverLetterUrl            String?
  cvTemplate                String?

  // Relaciones
  courseEnrollments         CourseEnrollment[]
  instructedCourses         Course[]            @relation("CourseInstructor")
  discussions               Discussion[]
  entrepreneurships         Entrepreneurship[]
  jobApplications           JobApplication[]
  youthApplications         YouthApplication[]  @relation("YouthApplications")
  newsComments              NewsComment[]
  municipality              Municipality?       @relation(fields: [municipalityId], references: [id])
  user                      User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizAttempts              QuizAttempt[]
  studentNotes              StudentNote[]

  @@index([userId])
  @@index([municipalityId])
  @@index([status])
  @@map("profiles")
}

model Course {
  id                String             @id @default(cuid())
  title             String
  slug              String             @unique
  description       String
  shortDescription  String?
  thumbnail         String?
  videoPreview      String?
  objectives        String[]
  prerequisites     String[]
  duration          Int
  level             CourseLevel
  category          CourseCategory
  isMandatory       Boolean?           @default(false)
  isActive          Boolean?           @default(true)
  rating            Decimal?           @default(0)
  studentsCount     Int                @default(0)
  completionRate    Decimal?           @default(0)
  totalLessons      Int                @default(0)
  totalQuizzes      Int                @default(0)
  totalResources    Int                @default(0)
  tags              String[]
  certification     Boolean?           @default(true)
  includedMaterials String[]
  instructorId      String?
  institutionName   String?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt
  publishedAt       DateTime?
  certificates      Certificate[]
  enrollments       CourseEnrollment[]
  modules           CourseModule[]
  instructor        Profile?           @relation("CourseInstructor", fields: [instructorId], references: [userId])
  quizzes           Quiz[]

  @@index([category])
  @@index([level])
  @@index([isMandatory])
  @@index([isActive])
  @@index([instructorId])
  @@map("courses")
}

model CourseModule {
  id                  String              @id @default(cuid())
  courseId            String
  title               String
  description         String?
  orderIndex          Int
  estimatedDuration   Int
  isLocked            Boolean             @default(false)
  prerequisites       String[]
  certificateTemplate String?
  hasCertificate      Boolean             @default(true)
  course              Course              @relation(fields: [courseId], references: [id], onDelete: Cascade)
  lessons             Lesson[]
  moduleCertificates  ModuleCertificate[]

  @@index([courseId])
  @@index([orderIndex])
  @@map("course_modules")
}

model Lesson {
  id          String           @id @default(cuid())
  moduleId    String
  title       String
  description String?
  content     String
  contentType LessonType
  videoUrl    String?
  audioUrl    String?          // Para lecciones de audio
  duration    Int?
  orderIndex  Int
  isRequired  Boolean          @default(true)
  isPreview   Boolean          @default(false)
  attachments Json?
  discussions Discussion[]
  progress    LessonProgress[]
  resources   LessonResource[]
  module      CourseModule     @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  quizzes     Quiz[]
  notes       StudentNote[]

  @@index([moduleId])
  @@index([orderIndex])
  @@map("lessons")
}

model JobOffer {
  id                  String           @id @default(cuid())
  title               String
  description         String
  requirements        String
  benefits            String?
  salaryMin           Decimal?
  salaryMax           Decimal?
  salaryCurrency      String?          @default("BOB")
  contractType        ContractType
  workSchedule        String
  workModality        WorkModality
  location            String
  municipality        String
  department          String           @default("Cochabamba")
  experienceLevel     ExperienceLevel
  educationRequired   EducationLevel?
  skillsRequired      String[]
  desiredSkills       String[]
  applicationDeadline DateTime?
  isActive            Boolean          @default(true)
  status              JobStatus        @default(ACTIVE)
  viewsCount          Int              @default(0)
  applicationsCount   Int              @default(0)
  featured            Boolean          @default(false)
  expiresAt           DateTime?
  publishedAt         DateTime         @default(now())
  companyId           String
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  latitude            Float?
  longitude           Float?
  images              String[]
  logo                String?
  applications        JobApplication[]
  company             Company          @relation(fields: [companyId], references: [id])
  jobQuestions        JobQuestion[]

  @@index([companyId])
  @@index([municipality])
  @@index([contractType])
  @@index([workModality])
  @@index([isActive])
  @@index([status])
  @@map("job_offers")
}

model JobApplication {
  id              String                  @id @default(cuid())
  applicantId     String
  jobOfferId      String
  coverLetter     String?
  status          ApplicationStatus       @default(SENT)
  appliedAt       DateTime                @default(now())
  reviewedAt      DateTime?
  notes           String?
  rating          Int?
  cvData          Json?
  profileImage    String?
  coverLetterFile String?
  cvFile          String?
  decisionReason  String?
  messages        JobApplicationMessage[]
  applicant       Profile                 @relation(fields: [applicantId], references: [userId])
  jobOffer        JobOffer                @relation(fields: [jobOfferId], references: [id])
  questionAnswers JobQuestionAnswer[]

  @@unique([applicantId, jobOfferId])
  @@index([applicantId])
  @@index([jobOfferId])
  @@index([status])
  @@map("job_applications")
}

model YouthApplication {
  id                String                            @id @default(cuid())
  title             String
  description       String
  cvFile            String?
  coverLetterFile   String?
  cvUrl             String?
  coverLetterUrl    String?
  status            YouthApplicationStatus            @default(ACTIVE)
  isPublic          Boolean                           @default(true)
  viewsCount        Int                               @default(0)
  applicationsCount Int                               @default(0)
  createdAt         DateTime                          @default(now())
  updatedAt         DateTime                          @updatedAt
  youthProfileId    String
  companyInterests  YouthApplicationCompanyInterest[]
  messages          YouthApplicationMessage[]
  youthProfile      Profile                           @relation("YouthApplications", fields: [youthProfileId], references: [userId])

  @@index([youthProfileId])
  @@index([status])
  @@index([isPublic])
  @@index([createdAt])
  @@map("youth_applications")
}

model Entrepreneurship {
  id            String        @id @default(cuid())
  ownerId       String
  name          String
  description   String
  category      String
  subcategory   String?
  businessStage BusinessStage
  logo          String?
  images        String[]
  website       String?
  email         String?
  phone         String?
  address       String?
  municipality  String
  department    String        @default("Cochabamba")
  socialMedia   Json?
  founded       DateTime?
  employees     Int?
  annualRevenue Decimal?
  businessModel String?
  targetMarket  String?
  isPublic      Boolean       @default(true)
  isActive      Boolean       @default(true)
  viewsCount    Int           @default(0)
  rating        Decimal?      @default(0)
  reviewsCount  Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  businessPlan  BusinessPlan?
  owner         Profile       @relation(fields: [ownerId], references: [userId])

  @@index([ownerId])
  @@index([category])
  @@index([municipality])
  @@index([businessStage])
  @@index([isActive, isPublic])
  @@map("entrepreneurships")
}

model NewsArticle {
  id             String        @id @default(cuid())
  title          String
  content        String
  summary        String
  imageUrl       String?
  videoUrl       String?
  authorId       String
  authorName     String
  authorType     NewsType
  authorLogo     String?
  status         NewsStatus    @default(DRAFT)
  priority       NewsPriority  @default(MEDIUM)
  featured       Boolean       @default(false)
  tags           String[]
  category       String
  publishedAt    DateTime?
  expiresAt      DateTime?
  viewCount      Int           @default(0)
  likeCount      Int           @default(0)
  commentCount   Int           @default(0)
  targetAudience String[]
  region         String?
  relatedLinks   Json?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  isEntrepreneurshipRelated Boolean @default(false) // Para contenido de emprendimientos
  author         Profile       @relation(fields: [authorId], references: [userId])
  comments       NewsComment[]

  @@index([authorId])
  @@index([status])
  @@index([category])
  @@index([publishedAt])
  @@index([targetAudience])
  @@map("news_articles")
}

model Resource {
  id              String   @id @default(cuid())
  title           String
  description     String
  type            String
  category        String
  format          String
  downloadUrl     String?
  externalUrl     String?
  thumbnail       String
  author          String
  publishedDate   DateTime
  downloads       Int      @default(0)
  rating          Float    @default(0)
  tags            String[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  isPublic        Boolean  @default(true)
  isEntrepreneurshipRelated Boolean @default(false) // Para contenido de emprendimientos
  createdByUserId String
  createdBy       User     @relation("ResourceCreator", fields: [createdByUserId], references: [id], onDelete: Cascade)

  @@index([createdByUserId])
  @@index([type])
  @@index([category])
  @@index([isPublic])
  @@map("resources")
}

model Company {
  id                        String                            @id @default(cuid())
  name                      String
  description               String?
  taxId                     String?
  legalRepresentative       String?
  businessSector            String?
  companySize               CompanySize?
  website                   String?
  email                     String?                           @unique
  phone                     String?
  address                   String?
  foundedYear               Int?
  logoUrl                   String?
  isActive                  Boolean                           @default(true)
  municipalityId            String
  createdBy                 String
  createdAt                 DateTime                          @default(now())
  updatedAt                 DateTime                          @updatedAt
  password                  String
  creator                   User                              @relation("CompanyCreator", fields: [createdBy], references: [id])
  municipality              Municipality                      @relation(fields: [municipalityId], references: [id])
  jobOffers                 JobOffer[]
  youthApplicationInterests YouthApplicationCompanyInterest[]

  @@unique([name, municipalityId])
  @@index([municipalityId])
  @@index([businessSector])
  @@index([isActive])
  @@index([createdBy])
  @@map("companies")
}

model Institution {
  id              String          @id @default(cuid())
  name            String
  department      String
  region          String?
  population      Int?
  mayorName       String?
  mayorEmail      String?
  mayorPhone      String?
  address         String?
  website         String?
  isActive        Boolean         @default(true)
  email           String          @unique
  password        String
  phone           String?
  institutionType InstitutionType
  customType      String?
  primaryColor    String?
  secondaryColor  String?
  createdBy       String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  creator         User            @relation("InstitutionCreator", fields: [createdBy], references: [id])

  @@unique([name, department])
  @@index([department])
  @@index([isActive])
  @@index([createdBy])
  @@index([institutionType])
  @@map("institutions")
}

model Municipality {
  id              String          @id @default(cuid())
  name            String
  department      String
  region          String?
  population      Int?
  mayorName       String?
  mayorEmail      String?
  mayorPhone      String?
  address         String?
  website         String?
  isActive        Boolean         @default(true)
  email           String          @unique
  password        String
  phone           String?
  createdBy       String
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  customType      String?
  institutionType InstitutionType @default(MUNICIPALITY)
  primaryColor    String?
  secondaryColor  String?
  companies       Company[]
  profiles        Profile[]
  creator         User            @relation("MunicipalityCreator", fields: [createdBy], references: [id])

  @@unique([name, department])
  @@index([department])
  @@index([isActive])
  @@index([createdBy])
  @@index([institutionType])
  @@map("municipalities")
}

// Enums
enum UserRole {
  YOUTH
  COMPANIES
  INSTITUTION
  SUPERADMIN
  INSTRUCTOR
}

enum UserStatus {
  ACTIVE
  INACTIVE
  PENDING_VERIFICATION
  SUSPENDED
}

enum InstitutionType {
  MUNICIPALITY
  NGO
  TRAINING_CENTER
  FOUNDATION
  OTHER
}

enum EducationLevel {
  PRIMARY
  SECONDARY
  TECHNICAL
  UNIVERSITY
  POSTGRADUATE
  OTHER
}

enum CompanySize {
  MICRO
  SMALL
  MEDIUM
  LARGE
}

enum JobStatus {
  ACTIVE
  PAUSED
  CLOSED
  DRAFT
}

enum ApplicationStatus {
  SENT
  UNDER_REVIEW
  PRE_SELECTED
  REJECTED
  HIRED
}

enum ContractType {
  FULL_TIME
  PART_TIME
  INTERNSHIP
  VOLUNTEER
  FREELANCE
}

enum WorkModality {
  ON_SITE
  REMOTE
  HYBRID
}

enum ExperienceLevel {
  NO_EXPERIENCE
  ENTRY_LEVEL
  MID_LEVEL
  SENIOR_LEVEL
}

enum CourseCategory {
  SOFT_SKILLS
  BASIC_COMPETENCIES
  JOB_PLACEMENT
  ENTREPRENEURSHIP
  TECHNICAL_SKILLS
  DIGITAL_LITERACY
  COMMUNICATION
  LEADERSHIP
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum LessonType {
  VIDEO
  AUDIO
  TEXT
  QUIZ
  EXERCISE
  DOCUMENT
  INTERACTIVE
}

enum BusinessStage {
  IDEA
  STARTUP
  GROWING
  ESTABLISHED
}

enum NewsType {
  COMPANY
  GOVERNMENT
  NGO
}

enum NewsStatus {
  PUBLISHED
  DRAFT
  ARCHIVED
}

enum NewsPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum YouthApplicationStatus {
  ACTIVE
  PAUSED
  CLOSED
  HIRED
}

enum CompanyInterestStatus {
  INTERESTED
  CONTACTED
  INTERVIEW_SCHEDULED
  HIRED
  NOT_INTERESTED
}
```

## Docker Configuration

### docker-compose.yml (Development)

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cemse_dev
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    ports:
      - "5432:5432"
    volumes:
      - db_dev_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d cemse_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - cemse-dev-network

  # Redis for caching
  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_dev_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - cemse-dev-network

  # MinIO Object Storage
  minio:
    image: minio/minio:latest
    restart: always
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    networks:
      - cemse-dev-network

  # MinIO Client for bucket initialization
  mc:
    image: minio/mc:latest
    container_name: minio-client
    depends_on:
      - minio
    environment:
      MC_HOST_local: http://minioadmin:minioadmin@minio:9000
    command: sh -c "sleep 10 && mc alias set local http://minio:9000 minioadmin minioadmin && mc mb local/videos local/images local/documents local/courses local/lessons local/resources local/cvs local/certificates && mc policy set public local/videos && mc policy set public local/images && mc policy set public local/documents && mc policy set public local/courses && mc policy set public local/lessons && mc policy set public local/resources && mc policy set public local/cvs && mc policy set public local/certificates && echo 'MinIO buckets created successfully' && tail -f /dev/null"
    networks:
      - cemse-dev-network

  # Prisma Studio (Development)
  prisma-studio:
    image: node:20-alpine
    working_dir: /app
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/cemse_dev
    ports:
      - "5555:5555"
    volumes:
      - .:/app
    command: sh -c "npm install -g prisma && prisma studio --hostname 0.0.0.0 --port 5555"
    networks:
      - cemse-dev-network
    depends_on:
      - db

volumes:
  db_dev_data:
    driver: local
  redis_dev_data:
    driver: local
  minio_data:
    driver: local

networks:
  cemse-dev-network:
    driver: bridge
```

### docker-compose.prod.yml (Producción)

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cemse_prod
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - cemse-network

  # Next.js Application
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/cemse_prod
      NODE_ENV: production
      PORT: 3000
    ports:
      - "3000:3000"
    networks:
      - cemse-network
    command: >
      sh -c "
        npx prisma migrate deploy &&
        npm run db:seed &&
        npm start
      "

volumes:
  db_data:
    driver: local

networks:
  cemse-network:
    driver: bridge
```

## Next.js Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    domains: [
      "localhost",
      "tu-dominio.com",
      "bucket-production.up.railway.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "bucket-production.up.railway.app",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*; connect-src 'self' https://*;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## TailwindCSS Configuration

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "shiny-text": "shiny-text 8s infinite",
        shine: "shine var(--duration) infinite linear",
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
      },
      keyframes: {
        "shiny-text": {
          "0%, 90%, 100%": {
            "background-position": "calc(-100% - var(--shiny-width)) 0",
          },
          "30%, 60%": {
            "background-position": "calc(100% + var(--shiny-width)) 0",
          },
        },
        shine: {
          "0%": {
            "background-position": "0% 0%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          to: {
            "background-position": "0% 0%",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

## Security and Encryption Configuration

### Elements that should NOT change:

- **Password hashing**: bcrypt with salt rounds 12
- **JWT Secret**: Secure environment variable
- **Sensitive data encryption**: crypto-js for data in transit
- **Security headers**: CSP, X-Frame-Options, etc.
- **Input validation**: Zod schemas in frontend and backend
- **Sanitization**: Data cleaning before storage

### Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cemse_dev"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/cemse_dev"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret-here"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_USE_SSL=false
MINIO_BASE_URL="http://localhost:9000"

# Redis
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=3000
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts de Desarrollo

```json
{
  "scripts": {
    "dev": "node server.js",
    "build": "next build",
    "build:no-lint": "DISABLE_ESLINT_PLUGIN=true next build",
    "start": "node server.js",
    "lint": "next lint",
    "clean": "node clean-cache.js",
    "dev:clean": "npm run clean && npm run dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:seed:enhanced": "tsx prisma/seed-enhanced.ts",
    "db:reset": "prisma migrate reset",
    "docker:up": "docker-compose up --build -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f",
    "docker:clean": "docker-compose down -v --remove-orphans",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up --build"
  }
}
```

## Flujos de Trabajo Principales

### 1. Flujo de Aplicación a Empleo

1. Joven ve oferta de trabajo
2. Completa formulario de aplicación (CV, carta de presentación)
3. Sistema crea registro en `JobApplication`
4. Empresa recibe notificación
5. Empresa revisa aplicación y cambia estado
6. Se habilita chat entre empresa y candidato
7. Proceso continúa hasta contratación o rechazo

### 2. Flujo de Postulación Abierta

1. Joven crea postulación abierta
2. Empresa explora postulaciones disponibles
3. Empresa marca interés en postulación específica
4. Se crea registro en `YouthApplicationCompanyInterest`
5. Se habilita chat entre empresa y joven
6. Proceso continúa hasta contratación o desinterés

### 3. Flujo de Curso Completo

1. Institución crea curso con módulos y lecciones
2. Joven se inscribe al curso
3. Joven progresa por lecciones en orden
4. Completa quizzes si existen
5. Al finalizar, se genera certificado automáticamente
6. Certificado se almacena en MinIO y se vincula al perfil

### 4. Flujo de Emprendimiento y Red

1. Joven crea emprendimiento
2. Otros jóvenes pueden ver emprendimientos
3. Envían solicitud de contacto
4. Si se acepta, se habilita chat
5. Sistema de mensajería integrado

## Implementation Notes

- Current Prisma schema is preserved at 90-95%
- Only incremental migrations required for new functionalities
- Maintain compatibility with existing code
- Implement improvements gradually
- Follow language rules strictly (Frontend in Spanish, Backend in English)
- Apply TypeScript and ESLint code standards
- Maintain good programming practices
- Optimize performance with React Query, lazy loading, memoization
- Implement modular and reusable code for scalability
- Ensure the project can run and build without issues

This system provides a solid and scalable foundation to implement all described functionalities, with appropriate relationships, optimized indexes, and well-defined enums to maintain data integrity."
