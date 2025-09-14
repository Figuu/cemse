import { prisma } from "@/lib/prisma";

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  moduleTitle?: string;
  instructorName?: string;
  completionDate: string;
  certificateId: string;
  courseId: string;
  moduleId?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  template: string;
  isActive: boolean;
}

export interface CertificateVerificationResult {
  isValid: boolean;
  certificate?: {
    id: string;
    certificateUrl: string | null;
    issuedAt: Date;
  };
  student?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  course?: {
    id: string;
    title: string;
  };
}

export class CertificateService {
  /**
   * Generate a certificate for course completion
   */
  static async generateCourseCertificate(
    studentId: string,
    courseId: string
  ): Promise<string | null> {
    try {
      // Get course and student data
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          instructor: true,
        },
      });

      const student = await prisma.profile.findUnique({
        where: { userId: studentId },
      });

      if (!course || !student) {
        throw new Error("Course or student not found");
      }

      // Check if student is enrolled and completed
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: studentId,
            courseId: courseId,
          },
        },
      });

      if (!enrollment || !enrollment.completedAt) {
        throw new Error("Student has not completed the course");
      }

      // Check if certificate already exists
      const existingCert = await prisma.certificate.findFirst({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
      });

      if (existingCert) {
        return existingCert.fileUrl;
      }

      // Generate certificate data
      const certificateData: CertificateData = {
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        courseTitle: course.title,
        instructorName: course.instructor ? 
          `${course.instructor.firstName || ''} ${course.instructor.lastName || ''}`.trim() : 
          undefined,
        completionDate: enrollment.completedAt!.toISOString(),
        certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: courseId,
      };

      // Generate certificate URL (in a real implementation, this would generate an actual PDF)
      const certificateUrl = await this.generateCertificateUrl(certificateData);

      // Create certificate record
      const certificate = await prisma.certificate.create({
        data: {
          studentId: studentId,
          courseId: courseId,
          fileUrl: certificateUrl,
        },
      });

      // Send notification
      await this.sendCertificateNotification(studentId, courseId, certificate.id, "course");

      return certificateUrl;
    } catch (error) {
      console.error("Error generating course certificate:", error);
      return null;
    }
  }

  /**
   * Generate a certificate for module completion
   */
  static async generateModuleCertificate(
    studentId: string,
    moduleId: string
  ): Promise<string | null> {
    try {
      // Get module and student data
      const courseModule = await prisma.courseModule.findUnique({
        where: { id: moduleId },
        include: {
          course: {
            include: {
              instructor: true,
            },
          },
        },
      });

      const student = await prisma.profile.findUnique({
        where: { userId: studentId },
      });

      if (!courseModule || !student) {
        throw new Error("Module or student not found");
      }

      // Check if student is enrolled in the course
      const enrollment = await prisma.courseEnrollment.findFirst({
        where: {
          studentId: studentId,
          courseId: courseModule.courseId,
        },
      });

      if (!enrollment) {
        throw new Error("Student is not enrolled in the course");
      }

      // Check if certificate already exists
      const existingCert = await prisma.moduleCertificate.findFirst({
        where: {
          studentId: studentId,
          moduleId: moduleId,
        },
      });

      if (existingCert) {
        return existingCert.fileUrl;
      }

      // Generate certificate data
      const certificateData: CertificateData = {
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        courseTitle: courseModule.course.title,
        moduleTitle: courseModule.title,
        instructorName: courseModule.course.instructor ? 
          `${courseModule.course.instructor.firstName || ''} ${courseModule.course.instructor.lastName || ''}`.trim() : 
          undefined,
        completionDate: new Date().toISOString(),
        certificateId: `MOD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: courseModule.courseId,
        moduleId: moduleId,
      };

      // Generate certificate URL
      const certificateUrl = await this.generateCertificateUrl(certificateData);

      // Create certificate record
      const certificate = await prisma.moduleCertificate.create({
        data: {
          studentId: studentId,
          moduleId: moduleId,
          fileUrl: certificateUrl,
        },
      });

      // Send notification
      await this.sendCertificateNotification(studentId, courseModule.courseId, certificate.id, "module");

      return certificateUrl;
    } catch (error) {
      console.error("Error generating module certificate:", error);
      return null;
    }
  }

  /**
   * Generate certificate URL (placeholder implementation)
   * In a real implementation, this would generate an actual PDF certificate
   */
  private static async generateCertificateUrl(data: CertificateData): Promise<string> {
    // This is a placeholder implementation
    // In a real application, you would:
    // 1. Use a PDF generation library like Puppeteer or jsPDF
    // 2. Create a certificate template with the student's data
    // 3. Upload the generated PDF to a cloud storage service
    // 4. Return the public URL of the certificate

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const certificateId = data.certificateId;
    
    // For now, return a placeholder URL
    // In production, this would be the actual certificate PDF URL
    return `${baseUrl}/api/certificates/${certificateId}/download`;
  }

  /**
   * Send certificate notification to student
   * Note: This is a placeholder implementation since the Notification model doesn't exist in the schema yet
   */
  private static async sendCertificateNotification(
    studentId: string,
    courseId: string,
    certificateId: string,
    type: "course" | "module"
  ): Promise<void> {
    try {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) return;

      // TODO: Implement when Notification model is added to schema
      console.log(`Certificate notification would be sent for ${type} certificate:`, {
        studentId,
        courseId,
        certificateId,
        courseTitle: course.title
      });
    } catch (error) {
      console.error("Error sending certificate notification:", error);
      // Don't throw error as this is not critical
    }
  }

  /**
   * Get certificate download URL
   */
  static async getCertificateDownloadUrl(certificateId: string): Promise<string | null> {
    try {
      // Check if it's a course certificate
      const courseCert = await prisma.certificate.findUnique({
        where: { id: certificateId },
      });

      if (courseCert) {
        return courseCert.fileUrl;
      }

      // Check if it's a module certificate
      const moduleCert = await prisma.moduleCertificate.findUnique({
        where: { id: certificateId },
      });

      if (moduleCert) {
        return moduleCert.fileUrl;
      }

      return null;
    } catch (error) {
      console.error("Error getting certificate download URL:", error);
      return null;
    }
  }

  /**
   * Verify certificate authenticity
   */
  static async verifyCertificate(certificateId: string): Promise<CertificateVerificationResult> {
    try {
      // Check course certificates
      const courseCert = await prisma.certificate.findUnique({
        where: { id: certificateId },
        include: {
          student: true,
          course: true,
        },
      });

      if (courseCert) {
        return {
          isValid: true,
          certificate: {
            id: courseCert.id,
            certificateUrl: courseCert.fileUrl,
            issuedAt: courseCert.issuedAt,
          },
          student: courseCert.student,
          course: courseCert.course,
        };
      }

      // Check module certificates
      const moduleCert = await prisma.moduleCertificate.findUnique({
        where: { id: certificateId },
        include: {
          student: true,
          module: {
            include: {
              course: true,
            },
          },
        },
      });

      if (moduleCert) {
        return {
          isValid: true,
          certificate: {
            id: moduleCert.id,
            certificateUrl: moduleCert.fileUrl,
            issuedAt: moduleCert.issuedAt,
          },
          student: moduleCert.student,
          course: moduleCert.module.course,
        };
      }

      return { isValid: false };
    } catch (error) {
      console.error("Error verifying certificate:", error);
      return { isValid: false };
    }
  }
}
