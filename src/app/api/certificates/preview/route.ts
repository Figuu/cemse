import { NextRequest, NextResponse } from "next/server";
import { CertificateService } from "@/lib/certificateService";

/**
 * Preview certificate template with sample data
 * This endpoint generates a sample certificate for testing/preview purposes
 */
export async function GET(request: NextRequest) {
  try {
    // Sample certificate data for preview
    const sampleData = {
      studentId: "preview-student-id",
      studentName: "Juan Pérez García",
      courseId: "preview-course-id",
      courseTitle: "Desarrollo de Habilidades Blandas y Liderazgo",
      instructorName: "María Rodriguez",
      completionDate: new Date().toISOString(),
      courseDuration: "40h 30m",
      courseLevel: "Intermedio",
      institutionName: "Emplea Emprende - Centro de Emprendimiento y Desarrollo Sostenible",
    };

    // Generate certificate using the service
    const result = await CertificateService.generateCourseCertificate(sampleData);

    if (!result.success || !result.certificateUrl) {
      return NextResponse.json(
        { error: result.error || "Failed to generate preview certificate" },
        { status: 500 }
      );
    }

    // Return the certificate URL for preview
    return NextResponse.json({
      success: true,
      certificateUrl: result.certificateUrl,
      message: "Preview certificate generated successfully",
      sampleData,
    });

  } catch (error) {
    console.error("Error generating preview certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate preview certificate" },
      { status: 500 }
    );
  }
}
