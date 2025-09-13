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
- `src/app/(dashboard)/companies/[id]/analytics/page.tsx` - Company analytics
- `src/app/(dashboard)/candidates/page.tsx` - Candidate search and filtering
- `src/app/(dashboard)/candidates/[id]/page.tsx` - Individual candidate profile
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
- `src/components/courses/CourseCard.tsx` - Course listing card component
- `src/components/courses/CourseEnrollment.tsx` - Course enrollment component
- `src/components/profile/ProfileForm.tsx` - User profile editing form
- `src/components/profile/SkillsAssessment.tsx` - Skills assessment component
- `src/components/profile/ResumeBuilder.tsx` - Resume builder component
- `src/components/companies/CompanyCard.tsx` - Company listing card component
- `src/components/companies/CompanyProfileForm.tsx` - Company profile management
- `src/components/candidates/CandidateCard.tsx` - Candidate listing card component
- `src/components/candidates/CandidateSearchFilters.tsx` - Candidate search filters
- `src/components/candidates/CandidateApplicationForm.tsx` - Job application form
- `src/components/analytics/CompanyAnalyticsDashboard.tsx` - Company analytics dashboard
- `src/components/analytics/AnalyticsCharts.tsx` - Analytics visualization components
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

### API Routes
- `src/app/api/users/route.ts` - User management API endpoints
- `src/app/api/jobs/route.ts` - Job management API endpoints
- `src/app/api/courses/route.ts` - Course management API endpoints
- `src/app/api/companies/route.ts` - Company management API endpoints
- `src/app/api/companies/[id]/route.ts` - Individual company operations
- `src/app/api/companies/[id]/jobs/route.ts` - Company job management
- `src/app/api/companies/[id]/analytics/route.ts` - Company analytics
- `src/app/api/companies/[id]/hiring-metrics/route.ts` - Hiring metrics
- `src/app/api/candidates/route.ts` - Candidate search API
- `src/app/api/candidates/[id]/route.ts` - Individual candidate operations
- `src/app/api/institutions/route.ts` - Institution management API endpoints
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

### Hooks & Services
- `src/hooks/useAuth.ts` - Authentication hook
- `src/hooks/useJobs.ts` - Job-related data fetching hooks
- `src/hooks/useCourses.ts` - Course-related data fetching hooks
- `src/hooks/useProfile.ts` - Profile management hooks
- `src/hooks/useCompanies.ts` - Company data management hooks
- `src/hooks/useCandidates.ts` - Candidate search and management hooks
- `src/hooks/useCompanyAnalytics.ts` - Company analytics hooks
- `src/hooks/useInstitutionStudents.ts` - Institution student management hooks
- `src/hooks/useInstitutionAnalytics.ts` - Institution analytics hooks
- `src/hooks/useEntrepreneurshipResources.ts` - Entrepreneurship resources hooks
- `src/hooks/useEntrepreneurshipNews.ts` - Entrepreneurship news hooks
- `src/hooks/useEntrepreneurshipPosts.ts` - Social network posts hooks
- `src/hooks/useEntrepreneurshipConnections.ts` - Connection management hooks
- `src/lib/financialCalculatorService.ts` - Financial calculations service
- `src/lib/postEngagementService.ts` - Post engagement analytics service
- `src/lib/businessPlanExportService.ts` - Business plan PDF generation
- `src/lib/utils/validation.ts` - Form validation utilities
- `src/lib/utils/fileUpload.ts` - File upload utilities
- `src/lib/utils/notifications.ts` - Notification utilities
- `src/context/AuthContext.tsx` - Authentication context provider
- `src/context/NotificationContext.tsx` - Notification context provider

### Types & Schemas
- `src/types/company.ts` - Company-related TypeScript types
- `prisma/schema.prisma` - Database schema with all models and relationships

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

### ⚠️ IMPORTANT: Tasks Needing Review

The following tasks were marked as completed but have been modified to align with the CEMSE description. These need to be reviewed to ensure the current implementation matches the updated requirements:

1. **Task 1.2**: Role-based navigation - INSTRUCTOR role removed, verify navigation works with YOUTH, COMPANIES, INSTITUTION, SUPERADMIN
2. **Task 2.4**: Resume builder - Verify 3 templates are actually implemented
3. **Task 2.6**: File upload - Verify chunked upload system is implemented
4. **Task 3.3**: Job applications - Verify Flow 1 (Company Job Offers) matches description
5. **Task 3.10**: Chat system - Verify integrated chat for job applications is implemented
6. **Task 4.3**: Course structure - Verify hierarchical Course → Modules → Lessons structure
7. **Task 4.5**: Quiz system - Verify unlimited attempts feature is implemented

### 🔍 INSTRUCTOR Role Clarification

The INSTRUCTOR role appears in the database schema but is not clearly defined in the main CEMSE description. Based on the schema, it seems instructors are just course instructors (Profile relation to Course), not a separate management role. The main roles should be:
- **YOUTH**: Job-seeking youth
- **COMPANIES**: Companies that post job offers  
- **INSTITUTION**: Institutions (municipalities, NGOs, training centers)
- **SUPERADMIN**: System administrator

## Tasks

- [x] 1.0 Core Dashboard Infrastructure
  - [x] 1.1 Create main dashboard layout with responsive navigation sidebar
  - [⚠️] 1.2 Implement role-based navigation menu (YOUTH, COMPANIES, INSTITUTION, SUPERADMIN) - NEEDS REVIEW: INSTRUCTOR role removed, verify navigation
  - [x] 1.3 Build dashboard header with user profile dropdown and notifications
  - [x] 1.4 Create statistics cards component for key metrics display
  - [x] 1.5 Implement recent activity feed component
  - [x] 1.6 Add responsive mobile navigation and hamburger menu
  - [x] 1.7 Create dashboard routing structure for all user types
  - [x] 1.8 Implement breadcrumb navigation component
  - [x] 1.9 Add loading states and error boundaries for dashboard pages
  - [x] 1.10 Create dashboard theme provider and dark mode toggle

- [x] 2.0 User Profile & Authentication System
  - [x] 2.1 Enhance existing authentication system with role-based access control
  - [x] 2.2 Create comprehensive user profile management interface
  - [x] 2.3 Implement skills assessment and tracking system
  - [⚠️] 2.4 Build resume builder with 3 available templates - NEEDS REVIEW: Verify 3 templates are implemented
  - [x] 2.5 Create profile completion progress indicator
  - [⚠️] 2.6 Implement chunked file upload for CV and profile pictures - NEEDS REVIEW: Verify chunked upload is implemented
  - [x] 2.7 Add profile verification and validation system
  - [x] 2.8 Create user preferences and notification settings
  - [x] 2.9 Implement profile search and discovery features
  - [x] 2.10 Add profile analytics and insights dashboard

- [x] 3.0 Job Management & Application System
  - [x] 3.1 Create job listing page with advanced search and filters
  - [x] 3.2 Implement job card component with company information
  - [⚠️] 3.3 Build job application form with file uploads (Flow 1: Company Job Offers) - NEEDS REVIEW: Verify Flow 1 implementation matches description
  - [x] 3.4 Create job application tracking system with status management
  - [x] 3.5 Implement job recommendation engine based on profile
  - [x] 3.6 Add job bookmarking and saved searches functionality
  - [x] 3.7 Create company job posting management interface
  - [x] 3.8 Implement application status notifications
  - [x] 3.9 Add job application analytics for companies
  - [⚠️] 3.10 Create integrated chat system for job applications - NEEDS REVIEW: Verify chat system is implemented
  - [ ] 3.11 Build youth open applications system (Flow 2: Open Applications)
  - [ ] 3.12 Implement company interest tracking for open applications
  - [ ] 3.13 Add interview scheduling and communication system

- [x] 4.0 Course Management & Learning System
  - [x] 4.1 Build course catalog with categories and search
  - [x] 4.2 Create course card component with enrollment options
  - [⚠️] 4.3 Implement hierarchical course structure (Course → Modules → Lessons) - NEEDS REVIEW: Verify hierarchical structure is implemented
  - [x] 4.4 Build course content viewer with video/audio/text support
  - [⚠️] 4.5 Create quiz system with unlimited attempts - NEEDS REVIEW: Verify unlimited attempts feature
  - [x] 4.6 Implement automatic certificate generation (PDF)
  - [x] 4.7 Add course discussion forums and Q&A
  - [x] 4.8 Create instructor dashboard for course management
  - [x] 4.9 Implement course analytics and reporting
  - [x] 4.10 Add course recommendation system

- [x] 5.0 Entrepreneurship Module (Simplified Hub System)
  - [x] 5.1 Create entrepreneurship hub page with resources and news
  - [x] 5.2 Build entrepreneurship resources management system
  - [x] 5.3 Implement entrepreneurship news management system
  - [x] 5.4 Create business plan builder with PDF generation
  - [x] 5.5 Build financial calculator for startups
  - [x] 5.6 Create entrepreneurship social network (mini social network)
  - [x] 5.7 Implement entrepreneurship friendship/connection system
  - [x] 5.8 Add entrepreneurship post sharing and interaction features
  - [ ] 5.9 Create entrepreneurship project profiles with basic info (name, description, social links, logo, images)
  - [ ] 5.10 Implement entrepreneurship networking and chat system

- [x] 6.0 Company & Institution Management
  - [x] 6.1 Build company profile management interface
  - [x] 6.2 Create company job posting and management system
  - [x] 6.3 Implement candidate search and filtering tools
  - [x] 6.4 Add company analytics and hiring metrics
  - [x] 6.5 Create institution student management dashboard
  - [x] 6.6 Implement program and course management for institutions
  - [x] 6.7 Add institution analytics and reporting
  - [ ] 6.8 Create municipality management system (create/manage companies, youth, institutions)
  - [ ] 6.9 Implement NGO and training center specific features

- [ ] 7.0 Content Management & Resources System
  - [ ] 7.1 Create news article management system (company, government, NGO types)
  - [ ] 7.2 Build resource library with categories and search
  - [ ] 7.3 Implement chunked file upload and management system
  - [ ] 7.4 Add content approval and moderation workflow
  - [ ] 7.5 Create content scheduling and publishing system
  - [ ] 7.6 Implement content analytics and engagement tracking
  - [ ] 7.7 Add content recommendation engine
  - [ ] 7.8 Create content templates and formatting tools
  - [ ] 7.9 Implement content versioning and history
  - [ ] 7.10 Add content sharing and social features

- [ ] 8.0 Communication & Messaging System
  - [ ] 8.1 Create integrated chat system for job applications
  - [ ] 8.2 Implement entrepreneurship networking chat
  - [ ] 8.3 Build company-youth communication system
  - [ ] 8.4 Add real-time messaging with notifications
  - [ ] 8.5 Create message history and search
  - [ ] 8.6 Implement file sharing in chats
  - [ ] 8.7 Add message status tracking (sent, delivered, read)
  - [ ] 8.8 Create chat moderation and reporting system
  - [ ] 8.9 Implement push notifications for messages
  - [ ] 8.10 Add video/voice call integration

- [ ] 9.0 Analytics & Reporting System
  - [ ] 9.1 Create comprehensive analytics dashboard for all roles
  - [ ] 9.2 Implement user engagement and activity tracking
  - [ ] 9.3 Build job placement and success rate analytics
  - [ ] 9.4 Add course completion and learning analytics
  - [ ] 9.5 Create entrepreneurship success metrics
  - [ ] 9.6 Implement real-time data visualization components
  - [ ] 9.7 Add custom report generation and export
  - [ ] 9.8 Create data export and API endpoints
  - [ ] 9.9 Implement predictive analytics and insights
  - [ ] 9.10 Add automated reporting and alerts system

- [ ] 10.0 Advanced Features & Integration
  - [ ] 10.1 Implement MinIO file storage integration
  - [ ] 10.2 Add Redis caching system
  - [ ] 10.3 Create email notification system with Resend
  - [ ] 10.4 Implement video processing with FFmpeg
  - [ ] 10.5 Add interactive maps with Leaflet
  - [ ] 10.6 Create PDF generation system for certificates and CVs
  - [ ] 10.7 Implement search functionality across all content
  - [ ] 10.8 Add social media integration for sharing
  - [ ] 10.9 Create backup and data recovery system
  - [ ] 10.10 Implement performance monitoring and optimization
