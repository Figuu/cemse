# Certificate System

This directory contains the certificate generation and management system for course completions.

## Components

### CourseCertificateTemplate.tsx
- React PDF template for course completion certificates
- Professional design with CEMSE branding
- Includes student name, course details, completion date, and signatures
- Generates PDF certificates using @react-pdf/renderer

### CertificateDownload.tsx
- UI component for certificate download functionality
- Shows certificate status and generation options
- Handles certificate download and generation requests
- Mobile responsive design

## Services

### CertificateService (lib/certificateService.ts)
- Handles PDF generation and MinIO upload
- Manages certificate storage and retrieval
- Provides certificate URL generation
- Handles bucket creation and policy management

## API Endpoints

### POST /api/courses/[id]/certificate
- Generates a new certificate for a completed course
- Uploads certificate to MinIO storage
- Returns certificate URL for download

### GET /api/courses/[id]/certificate
- Checks certificate status for a course
- Returns certificate URL if exists
- Provides completion and certification status

## Hooks

### useCertificate
- React hook for certificate management
- Provides certificate status, generation, and download functionality
- Handles loading states and error management
- Integrates with TanStack Query for caching

## Features

- **Automatic Generation**: Certificates are automatically generated when a course is 100% completed
- **PDF Format**: Professional PDF certificates with proper formatting
- **MinIO Storage**: Certificates are stored in MinIO for reliable access
- **Download Support**: Users can download certificates as PDF files
- **Mobile Responsive**: Certificate UI works on all device sizes
- **Error Handling**: Comprehensive error handling and user feedback
- **Caching**: Efficient certificate status caching with TanStack Query

## Usage

```tsx
import { CertificateDownload } from '@/components/certificates/CertificateDownload';

<CertificateDownload
  courseId={courseId}
  courseTitle={courseTitle}
  isCompleted={isCompleted}
  hasCertification={hasCertification}
/>
```

## Requirements

- Course must be 100% completed
- Course must have `certification: true` in database
- User must be enrolled in the course
- MinIO must be properly configured and running

## Environment Variables

- `MINIO_PUBLIC_URL`: Public URL for MinIO access
- `MINIO_ENDPOINT`: MinIO server endpoint
- `MINIO_ACCESS_KEY`: MinIO access key
- `MINIO_SECRET_KEY`: MinIO secret key


