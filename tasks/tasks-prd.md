## Relevant Files

### Dashboard & Layout
- `src/app/(dashboard)/page.tsx` - Main dashboard page for authenticated users
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with navigation
- `src/app/(dashboard)/profile/page.tsx` - User profile management page
- `src/app/(dashboard)/jobs/page.tsx` - Job listings and search page
- `src/app/(dashboard)/courses/page.tsx` - Course catalog and enrollment page
- `src/app/(dashboard)/entrepreneurship/page.tsx` - Entrepreneurship hub page
- `src/app/(dashboard)/companies/page.tsx` - Company browsing and discovery
- `src/app/(dashboard)/companies/[id]/page.tsx` - Individual company profile
- `src/app/(dashboard)/companies/[id]/jobs/page.tsx` - Company job management
- `src/app/(dashboard)/companies/[id]/employees/page.tsx` - Company employee management
- `src/app/(dashboard)/companies/[id]/analytics/page.tsx` - Company analytics
- `src/app/(dashboard)/candidates/page.tsx` - Candidate search and filtering
- `src/app/(dashboard)/candidates/[id]/page.tsx` - Individual candidate profile
- `src/app/(dashboard)/institutions/page.tsx` - Institution browsing and discovery
- `src/app/(dashboard)/institutions/[id]/page.tsx` - Individual institution profile
- `src/app/(dashboard)/institutions/[id]/dashboard/page.tsx` - Institution dashboard
- `src/app/(dashboard)/institutions/[id]/programs/page.tsx` - Program management
- `src/app/(dashboard)/institutions/[id]/courses/page.tsx` - Course management
- `src/app/(dashboard)/institutions/[id]/analytics/page.tsx` - Institution analytics
- `src/app/(dashboard)/entrepreneurship/calculator/page.tsx` - Financial calculator
- `src/app/(dashboard)/entrepreneurship/network/page.tsx` - Entrepreneurship social network
- `src/app/(dashboard)/entrepreneurship/connections/page.tsx` - Connection management
- `src/app/(dashboard)/entrepreneurship/analytics/page.tsx` - Post analytics

### Components
- `src/components/dashboard/DashboardHeader.tsx` - Dashboard header with user info and navigation
- `src/components/dashboard/StatsCards.tsx` - Statistics cards for dashboard overview
- `src/components/dashboard/RecentActivity.tsx` - Recent activity feed component
- `src/components/dashboard/RoleBasedNavigation.tsx` - Role-based navigation menu
- `src/components/jobs/JobCard.tsx` - Job listing card component
- `src/components/jobs/JobFilters.tsx` - Job search and filtering component
- `src/components/jobs/JobApplicationForm.tsx` - Job application form component
- `src/components/jobs/JobPostingForm.tsx` - Job posting creation form
- `src/components/jobs/YouthApplicationForm.tsx` - Youth open application form
- `src/components/jobs/CompanyInterestForm.tsx` - Company interest in youth applications
- `src/components/courses/CourseCard.tsx` - Course listing card component
- `src/components/courses/CourseEnrollment.tsx` - Course enrollment component
- `src/components/profile/ProfileForm.tsx` - User profile editing form
- `src/components/profile/SkillsAssessment.tsx` - Skills assessment component
- `src/components/profile/CVBuilder.tsx` - CV builder component with 3 templates
- `src/components/profile/CoverLetterBuilder.tsx` - Cover letter builder component
- `src/components/companies/CompanyCard.tsx` - Company listing card component
- `src/components/companies/CompanyProfileForm.tsx` - Company profile management
- `src/components/companies/EmployeeManagement.tsx` - Employee management component
- `src/components/candidates/CandidateCard.tsx` - Candidate listing card component
- `src/components/candidates/CandidateSearchFilters.tsx` - Candidate search filters
- `src/components/candidates/CandidateApplicationForm.tsx` - Job application form
- `src/components/analytics/CompanyAnalyticsDashboard.tsx` - Company analytics dashboard
- `src/components/analytics/AnalyticsCharts.tsx` - Analytics visualization components
- `src/components/institutions/InstitutionCard.tsx` - Institution listing card component
- `src/components/institutions/InstitutionProfileForm.tsx` - Institution profile management
- `src/components/institutions/StudentManagementDashboard.tsx` - Student management
- `src/components/institutions/ProgramManagement.tsx` - Program management
- `src/components/institutions/CourseManagement.tsx` - Course management
- `src/components/institutions/EnrollmentManagement.tsx` - Enrollment management
- `src/components/institutions/InstitutionAnalyticsDashboard.tsx` - Institution analytics
- `src/components/institutions/ReportManagement.tsx` - Report management
- `src/components/entrepreneurship/ResourceCard.tsx` - Entrepreneurship resource card
- `src/components/entrepreneurship/NewsCard.tsx` - Entrepreneurship news card
- `src/components/entrepreneurship/FinancialCalculatorForm.tsx` - Financial calculator form
- `src/components/entrepreneurship/FinancialCharts.tsx` - Financial visualization
- `src/components/entrepreneurship/PostCard.tsx` - Social network post card
- `src/components/entrepreneurship/CreatePostForm.tsx` - Post creation form
- `src/components/entrepreneurship/UserCard.tsx` - User profile card
- `src/components/entrepreneurship/ConnectionCard.tsx` - Connection management card
- `src/components/entrepreneurship/PostShareModal.tsx` - Post sharing modal
- `src/components/entrepreneurship/PostInteractions.tsx` - Post interaction buttons
- `src/components/entrepreneurship/PostAnalytics.tsx` - Post analytics display
- `src/components/entrepreneurship/EnhancedPostCard.tsx` - Enhanced post card
- `src/components/chat/ChatInterface.tsx` - Unified chat interface
- `src/components/chat/MessageBubble.tsx` - Message bubble component
- `src/components/chat/ChatList.tsx` - Chat list component

### API Routes
- `src/app/api/users/route.ts` - User management API endpoints
- `src/app/api/jobs/route.ts` - Job management API endpoints
- `src/app/api/applications/route.ts` - Job application management
- `src/app/api/applications/[id]/route.ts` - Individual application operations
- `src/app/api/youth-applications/route.ts` - Youth open applications management
- `src/app/api/youth-applications/[id]/route.ts` - Individual youth application operations
- `src/app/api/courses/route.ts` - Course management API endpoints
- `src/app/api/companies/route.ts` - Company management API endpoints
- `src/app/api/companies/[id]/route.ts` - Individual company operations
- `src/app/api/companies/[id]/jobs/route.ts` - Company job management
- `src/app/api/companies/[id]/employees/route.ts` - Company employee management
- `src/app/api/companies/[id]/analytics/route.ts` - Company analytics
- `src/app/api/companies/[id]/hiring-metrics/route.ts` - Hiring metrics
- `src/app/api/candidates/route.ts` - Candidate search API
- `src/app/api/candidates/[id]/route.ts` - Individual candidate operations
- `src/app/api/institutions/route.ts` - Institution management API endpoints
- `src/app/api/institutions/[id]/route.ts` - Individual institution operations
- `src/app/api/institutions/[id]/students/route.ts` - Student management
- `src/app/api/institutions/[id]/programs/route.ts` - Program management
- `src/app/api/institutions/[id]/courses/route.ts` - Course management
- `src/app/api/institutions/[id]/analytics/route.ts` - Institution analytics
- `src/app/api/institutions/[id]/reports/route.ts` - Report generation
- `src/app/api/entrepreneurship/resources/route.ts` - Entrepreneurship resources
- `src/app/api/entrepreneurship/news/route.ts` - Entrepreneurship news
- `src/app/api/entrepreneurship/posts/route.ts` - Social network posts
- `src/app/api/entrepreneurship/connections/route.ts` - Connection management
- `src/app/api/files/route.ts` - File upload and management API
- `src/app/api/resources/route.ts` - Resource management API endpoints
- `src/app/api/news/route.ts` - News and content management API
- `src/app/api/messages/route.ts` - Messaging system API
- `src/app/api/messages/[id]/route.ts` - Individual message operations

### Hooks & Services
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useJobs.ts` - Job-related data fetching hooks
- `src/hooks/useApplications.ts` - Application management hooks
- `src/hooks/useYouthApplications.ts` - Youth application hooks
- `src/hooks/useCourses.ts` - Course-related data fetching hooks
- `src/hooks/useProfile.ts` - Profile management hooks
- `src/hooks/useCompanies.ts` - Company data management hooks
- `src/hooks/useCompanyEmployees.ts` - Company employee management hooks
- `src/hooks/useCandidates.ts` - Candidate search and management hooks
- `src/hooks/useCompanyAnalytics.ts` - Company analytics hooks
- `src/hooks/useInstitutions.ts` - Institution management hooks
- `src/hooks/useInstitutionStudents.ts` - Institution student management hooks
- `src/hooks/useInstitutionAnalytics.ts` - Institution analytics hooks
- `src/hooks/useEntrepreneurshipResources.ts` - Entrepreneurship resources hooks
- `src/hooks/useEntrepreneurshipNews.ts` - Entrepreneurship news hooks
- `src/hooks/useEntrepreneurshipPosts.ts` - Social network posts hooks
- `src/hooks/useEntrepreneurshipConnections.ts` - Connection management hooks
- `src/hooks/useMessages.ts` - Messaging system hooks
- `src/lib/financialCalculatorService.ts` - Financial calculations service
- `src/lib/postEngagementService.ts` - Post engagement analytics service
- `src/lib/businessPlanExportService.ts` - Business plan PDF generation
- `src/lib/certificateService.ts` - Certificate PDF generation
- `src/lib/cvBuilderService.ts` - CV PDF generation with templates
- `src/lib/coverLetterService.ts` - Cover letter PDF generation
- `src/lib/utils/validation.ts` - Form validation utilities
- `src/lib/utils/fileUpload.ts` - File upload utilities
- `src/lib/utils/notifications.ts` - Notification utilities
- `src/context/AuthContext.tsx` - Authentication context provider
- `src/context/NotificationContext.tsx` - Notification context provider

### Types & Schemas
- `src/types/company.ts` - Company-related TypeScript types
- `src/types/application.ts` - Application-related TypeScript types
- `src/types/employee.ts` - Employee-related TypeScript types
- `prisma/schema.prisma` - Database schema with all models and relationships

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## System Overview

### User Roles & Capabilities

#### ADMIN (SUPERADMIN)
- Create and manage all other user types
- Create news, resources, courses, job offers
- Access all system functionalities
- View and manage all applications

#### INSTITUTION (Municipality, NGO, Training Center)
- **Municipality**: Create news, resources, courses, companies, youth, institutions (except other municipalities)
- **NGO**: Create and manage companies, courses, news
- **Training Center**: Same capabilities as NGO
- Manage created entities (edit/delete)
- Access analytics and reporting

#### COMPANY
- Create job offers and news/resources
- **Flow 1**: Receive job applications → Review → Interview → Hire/Reject
- **Flow 2**: Browse youth open applications → Express interest → Chat → Hire/Reject
- Manage hired employees (view, terminate, update status)
- Access hiring analytics

#### YOUTH
- Apply to job offers (Flow 1)
- Create open applications (Flow 2)
- Browse institutions and companies
- Enroll in courses and track progress
- Create entrepreneurship projects
- Build CV and cover letters
- Network with other entrepreneurs

## Tasks

### 🔴 HIGH PRIORITY - Core System Flows

- [x] **1.0 Job Application Flow 1 (Company Job Offers)** ✅ COMPLETED
  - [x] 1.1 Create job application form with CV/cover letter upload
  - [x] 1.2 Implement application status tracking (SENT → UNDER_REVIEW → PRE_SELECTED → REJECTED/HIRED)
  - [x] 1.3 Build company application review interface
  - [x] 1.4 Create integrated chat system for job applications
  - [x] 1.5 Implement hiring workflow (mark as hired, create CompanyEmployee record)
  - [x] 1.6 Add employee management interface for companies

- [x] **2.0 Job Application Flow 2 (Youth Open Applications)** ✅ COMPLETED
  - [x] 2.1 Create youth open application form
  - [x] 2.2 Build company interest tracking system (INTERESTED → CONTACTED → INTERVIEW_SCHEDULED → HIRED/NOT_INTERESTED)
  - [x] 2.3 Implement company browsing of youth applications
  - [x] 2.4 Create company interest expression interface
  - [x] 2.5 Add integrated chat for youth application conversations
  - [x] 2.6 Build hiring workflow from open applications

- [x] **3.0 Employee Management System** ✅ COMPLETED
  - [x] 3.1 Create CompanyEmployee model implementation
  - [x] 3.2 Build employee management dashboard for companies
  - [x] 3.3 Implement employee status management (ACTIVE/TERMINATED/ON_LEAVE)
  - [x] 3.4 Create employee history and records

### 🟡 MEDIUM PRIORITY - Core Features

- [x] **4.0 CV Builder System** ✅ COMPLETED
  - [x] 4.1 Implement CV builder with 3 templates
  - [x] 4.2 Create cover letter builder with 3 templates
  - [x] 4.3 Add PDF generation and MinIO upload
  - [x] 4.4 Implement CV/cover letter management in profile
  - [x] 4.5 Create template selection interface

- [x] **5.0 Course System Enhancement** ✅ COMPLETED
  - [x] 5.1 Verify Course → Module → Lesson hierarchy implementation
  - [x] 5.2 Implement lesson progress tracking
  - [x] 5.3 Create quiz system with unlimited attempts
  - [x] 5.4 Build automatic certificate generation
  - [x] 5.5 Add course completion tracking
  - [x] 5.6 Implement course enrollment management

- [x] **6.0 Messaging System** ✅ COMPLETED
  - [x] 6.1 Create unified messaging interface
  - [x] 6.2 Implement context-aware messaging (job applications, youth applications, entrepreneurship)
  - [x] 6.3 Add real-time messaging with notifications
  - [x] 6.4 Create message history and search
  - [x] 6.5 Add message status tracking

### 🟢 LOW PRIORITY - Enhanced Features

- [x] **7.0 Entrepreneurship Network** ✅ COMPLETED
  - [x] 7.1 Create entrepreneurship project profiles
  - [x] 7.2 Implement connection/friendship system
  - [x] 7.3 Build entrepreneurship chat system
  - [x] 7.4 Add business plan builder
  - [x] 7.5 Create financial calculator

- [x] **8.0 Institution Management** ✅ COMPLETED
  - [x] 8.1 Create municipality management system
  - [x] 8.2 Implement NGO and training center features
  - [x] 8.3 Build institution-specific analytics
  - [x] 8.4 Add institution user management

- [x] **9.0 Content Management** ✅ COMPLETED
  - [x] 9.1 Create news management system
  - [x] 9.2 Build resource library
  - [x] 9.3 Implement content approval workflow
  - [x] 9.4 Add content scheduling
  - [x] 9.5 Create content analytics

- [x] **10.0 Analytics & Reporting** ✅ COMPLETED
  - [x] 10.1 Build comprehensive analytics dashboard
  - [x] 10.2 Implement user engagement tracking
  - [x] 10.3 Create job placement analytics
  - [x] 10.4 Add course completion analytics
  - [x] 10.5 Build entrepreneurship success metrics

### ✅ COMPLETED AND VERIFIED

- [x] **Job Application Flow 1** - Company job offers with application review, status tracking, and employee management
- [x] **Job Application Flow 2** - Youth open applications with company interest tracking and hiring workflow  
- [x] **Employee Management System** - Complete employee lifecycle management with status tracking
- [x] **Course System** - Complete learning management with progress tracking, quizzes, and certificate generation
- [x] **Course Structure** - Hierarchical Course → Module → Lesson structure properly implemented
- [x] **Quiz System** - Unlimited attempts feature working with comprehensive quiz management
- [x] **CV Builder System** - 3 professional templates with real react-pdf generation, cover letter builder, PDF generation service, API routes, dashboard integration. Ready for production.
- [x] **Messaging System** - Unified messaging interface with context-aware messaging, real-time notifications, message history, and status tracking. Ready for production.

### ⚠️ PARTIALLY IMPLEMENTED (Needs Completion)

- [⚠️] **File Upload** - Basic upload exists but no MinIO integration or chunked upload system

### ✅ COMPLETED AND VERIFIED

- [x] **Dashboard Infrastructure** - Role-based navigation works with all user roles, missing pages created (settings, students, resources, news), navigation properly configured for YOUTH, COMPANIES, INSTITUTION, and SUPERADMIN roles

### ✅ COMPLETED AND VERIFIED

- [x] **File Upload System** - Enhanced file upload with chunked upload support, file management interface, progress tracking, retry mechanism, and comprehensive file type validation. Ready for production.

### ✅ COMPLETED AND VERIFIED

- [x] **Chat System** - Integrated chat functionality into job application flows. Both Job Application Flow 1 (Company Job Offers) and Job Application Flow 2 (Youth Open Applications) now have fully functional chat integration with context-aware messaging components. Ready for production.

- [x] **Profile System** - Enhanced profile system with CV builder templates (Modern, Classic, Creative), integrated chunked file upload system, comprehensive file management interface, and proper integration between CV builder and file upload functionality. Ready for production.

### 🔧 INFRASTRUCTURE & INTEGRATION

- [x] **11.0 File Management** ✅ COMPLETED
  - [x] 11.1 Implement MinIO integration for file storage
  - [x] 11.2 Add chunked file upload system
  - [x] 11.3 Create file management interface
  - [x] 11.4 Implement file security and access control

- [x] **12.0 Notification System** ✅ COMPLETED
  - [x] 12.1 Implement email notifications with Resend
  - [x] 12.2 Add push notifications
  - [x] 12.3 Create notification preferences
  - [x] 12.4 Build notification history

- [x] **13.0 Search & Discovery** ✅ COMPLETED
  - [x] 13.1 Implement global search functionality
  - [x] 13.2 Create advanced filtering systems
  - [x] 13.3 Add recommendation engines
  - [x] 13.4 Build discovery interfaces

- [x] **14.0 Entrepreneurship Features** ✅ COMPLETED
  - [x] 14.1 Create business plan builder
  - [x] 14.2 Implement financial calculator
  - [x] 14.3 Build entrepreneurship network
  - [x] 14.4 Add project discovery

- [x] **15.0 Analytics & Reporting** ✅ COMPLETED
  - [x] 15.1 Build comprehensive analytics dashboard
  - [x] 15.2 Implement user engagement tracking
  - [x] 15.3 Create job placement analytics
  - [x] 15.4 Add course completion analytics
  - [x] 15.5 Build entrepreneurship success metrics

## Implementation Notes

### Database Schema Updates
- ✅ CompanyEmployee model added for employee management
- ✅ EmployeeStatus enum added
- ✅ JobApplication fields added for hiring tracking
- ✅ Relations updated for employee management

### Key Flows to Implement
1. **Job Application Flow 1**: Company posts job → Youth applies → Company reviews → Chat → Hire/Reject → Employee management
2. **Job Application Flow 2**: Youth creates open application → Company browses → Expresses interest → Chat → Hire/Reject → Employee management
3. **Course Flow**: Institution creates course → Youth enrolls → Takes lessons → Passes quizzes → Gets certificate
4. **Entrepreneurship Flow**: Youth creates project → Other youth discover → Connect → Chat → Network

### Priority Order
1. Complete job application flows (both flows)
2. Implement employee management
3. Enhance CV builder system
4. Verify and complete course system
5. Implement messaging system
6. Add entrepreneurship features
7. Complete analytics and reporting