import { pdf } from '@react-pdf/renderer';
import { CourseCertificateTemplate } from '@/components/certificates/CourseCertificateTemplate';
import { minioClient } from './minioClientService';

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
    const certificateDoc = CourseCertificateTemplate({
      studentName: data.studentName,
      courseTitle: data.courseTitle,
      instructorName: data.instructorName,
      completionDate: data.completionDate,
      courseDuration: data.courseDuration,
      courseLevel: data.courseLevel,
      institutionName: data.institutionName,
    });

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

    // Upload to MinIO
    await minioClient.putObject(
      this.BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    );

    // Return the public URL
    return `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${this.BUCKET_NAME}/${objectName}`;
  }

  /**
   * Ensure the certificates bucket exists
   */
  private static async ensureBucketExists(): Promise<void> {
    try {
      const exists = await minioClient.bucketExists(this.BUCKET_NAME);
      if (!exists) {
        await minioClient.makeBucket(this.BUCKET_NAME, 'us-east-1');
        
        // Set bucket policy to allow public read access
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.BUCKET_NAME}/*`],
            },
          ],
        };
        
        await minioClient.setBucketPolicy(this.BUCKET_NAME, JSON.stringify(policy));
      }
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
      const objects = await minioClient.listObjects(this.BUCKET_NAME, prefix);
      
      let latestObject: any = null;
      let latestDate = new Date(0);
      
      for await (const obj of objects) {
        if (obj.lastModified && obj.lastModified > latestDate) {
          latestDate = obj.lastModified;
          latestObject = obj;
        }
      }
      
      if (latestObject) {
        return `${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${this.BUCKET_NAME}/${latestObject.name}`;
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
      const objects = await minioClient.listObjects(this.BUCKET_NAME, prefix);
      
      for await (const obj of objects) {
        await minioClient.removeObject(this.BUCKET_NAME, obj.name!);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      return false;
    }
  }
}