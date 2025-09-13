import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificateService } from "@/lib/certificateService";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courseId, moduleId, studentId } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    if (!courseId && !moduleId) {
      return NextResponse.json({ error: "Either courseId or moduleId is required" }, { status: 400 });
    }

    let certificateUrl: string | null = null;

    if (courseId) {
      // Generate course certificate
      certificateUrl = await CertificateService.generateCourseCertificate(studentId, courseId);
    } else if (moduleId) {
      // Generate module certificate
      certificateUrl = await CertificateService.generateModuleCertificate(studentId, moduleId);
    }

    if (!certificateUrl) {
      return NextResponse.json({ 
        error: "Failed to generate certificate. Student may not have completed the course/module." 
      }, { status: 400 });
    }

    // Get certificate details for response
    let certificate;
    if (courseId) {
      certificate = await prisma.certificate.findFirst({
        where: {
          studentId: studentId,
          courseId: courseId,
        },
        include: {
          course: true,
          student: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });
    } else {
      certificate = await prisma.moduleCertificate.findFirst({
        where: {
          studentId: studentId,
          moduleId: moduleId,
        },
        include: {
          module: {
            include: {
              course: true,
            },
          },
          student: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { issuedAt: "desc" },
      });
    }

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        type: courseId ? "course" : "module",
        certificateUrl: certificate.certificateUrl,
        issuedAt: certificate.issuedAt.toISOString(),
        student: {
          id: certificate.student.id,
          name: `${certificate.student.profile?.firstName || ''} ${certificate.student.profile?.lastName || ''}`.trim(),
        },
        course: courseId ? {
          id: certificate.course.id,
          title: certificate.course.title,
        } : {
          id: certificate.module.course.id,
          title: certificate.module.course.title,
        },
        module: moduleId ? {
          id: certificate.module.id,
          title: certificate.module.title,
        } : null,
      },
    });

  } catch (error) {
    console.error("Error generating certificate:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
