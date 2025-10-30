import { pdf } from '@react-pdf/renderer';
import React from 'react';
import { CourseCertificateTemplate } from '@/components/certificates/CourseCertificateTemplate';
import { minioService } from './minioService';

export interface CertificateData {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  courseDuration: string;
  courseLevel: string;
  institutionName?: string;
}

export interface CertificateResult {
  success: boolean;
  certificateUrl?: string;
  error?: string;
}

export class CertificateService {
  private static readonly BUCKET_NAME = 'certificates';
  private static readonly CERTIFICATE_PREFIX = 'course-certificates/';

  /**
   * Generate and upload a course completion certificate
   */
  static async generateCourseCertificate(data: CertificateData): Promise<CertificateResult> {
    try {
      // Generate PDF blob
      const pdfBlob = await this.generatePDFBlob(data);
      
      // Upload to MinIO
      const certificateUrl = await this.uploadToMinIO(pdfBlob, data);
      
      return {
        success: true,
        certificateUrl,
      };
    } catch (error) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate PDF blob from certificate template
   */
  private static async generatePDFBlob(data: CertificateData): Promise<Blob> {
    // Create the certificate document using the template component
    const certificateDoc = CourseCertificateTemplate({
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      instructorName: data.instructorName,
      completionDate: data.completionDate,
      courseDuration: data.courseDuration,
      courseLevel: data.courseLevel,
      institutionName: data.institutionName,
    }) as any;

    const pdfBlob = await pdf(certificateDoc).toBlob();
    return pdfBlob;
  }

  /**
   * Upload certificate to MinIO
   */
  private static async uploadToMinIO(pdfBlob: Blob, data: CertificateData): Promise<string> {
    // Ensure bucket exists
    await this.ensureBucketExists();

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${data.courseId}_${data.studentId}_${timestamp}.pdf`;
    const objectName = `${this.CERTIFICATE_PREFIX}${filename}`;

    // Convert blob to buffer
    const buffer = Buffer.from(await pdfBlob.arrayBuffer());

    // Upload to MinIO using the server-side service
    const result = await minioService.uploadFile(
      buffer,
      filename,
      'application/pdf',
      this.BUCKET_NAME
    );

    // Return proxy URL (consistent with other uploads)
    const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;
    return proxyUrl;
  }

  /**
   * Ensure the certificates bucket exists
   */
  private static async ensureBucketExists(): Promise<void> {
    try {
      // Initialize buckets (this will create the certificates bucket if it doesn't exist)
      await minioService.initializeBuckets();
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw new Error('Failed to create certificates bucket');
    }
  }

  /**
   * Get certificate URL if it exists
   */
  static async getCertificateUrl(courseId: string, studentId: string): Promise<string | null> {
    try {
      await this.ensureBucketExists();
      
      // List objects with the course and student prefix
      const prefix = `${this.CERTIFICATE_PREFIX}${courseId}_${studentId}_`;
      const objects = await minioService.listFiles(this.BUCKET_NAME, prefix);
      
      let latestObject: any = null;
      let latestDate = new Date(0);
      
      for (const obj of objects) {
        if (obj.lastModified && obj.lastModified > latestDate) {
          latestDate = obj.lastModified;
          latestObject = obj;
        }
      }
      
      if (latestObject) {
        return minioService.getPublicUrl(this.BUCKET_NAME, latestObject.name);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting certificate URL:', error);
      return null;
    }
  }

  /**
   * Delete certificate
   */
  static async deleteCertificate(courseId: string, studentId: string): Promise<boolean> {
    try {
      await this.ensureBucketExists();
      
      const prefix = `${this.CERTIFICATE_PREFIX}${courseId}_${studentId}_`;
      const objects = await minioService.listFiles(this.BUCKET_NAME, prefix);
      
      for (const obj of objects) {
        await minioService.deleteFile(this.BUCKET_NAME, obj.name);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      return false;
    }
  }
}