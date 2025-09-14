import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // "course" or "module"

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      studentId: session.user.id,
    };

    let certificates = [];
    let totalCount = 0;

    if (type === "module") {
      // Get module certificates
      [certificates, totalCount] = await Promise.all([
        prisma.moduleCertificate.findMany({
          where,
          orderBy: { issuedAt: "desc" },
          skip,
          take: limit,
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
        }),
        prisma.moduleCertificate.count({ where }),
      ]);
    } else {
      // Get course certificates
      [certificates, totalCount] = await Promise.all([
        prisma.certificate.findMany({
          where,
          orderBy: { issuedAt: "desc" },
          skip,
          take: limit,
          include: {
            course: {
              include: {
                instructor: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            student: {
              include: {
                profile: true,
              },
            },
          },
        }),
        prisma.certificate.count({ where }),
      ]);
    }

    // Transform certificates for frontend
    const transformedCertificates = certificates.map(cert => {
      const isModuleCert = 'module' in cert;
      
      return {
        id: cert.id,
        type: isModuleCert ? "module" : "course",
        certificateUrl: cert.certificateUrl,
        issuedAt: cert.issuedAt.toISOString(),
        student: {
          id: cert.student.id,
          name: `${cert.student.profile?.firstName || ''} ${cert.student.profile?.lastName || ''}`.trim(),
          email: cert.student.profile?.email || '',
        },
        course: isModuleCert ? {
          id: cert.module.course.id,
          title: cert.module.course.title,
          instructor: cert.module.course.instructor ? {
            id: cert.module.course.instructor.id,
            name: `${cert.module.course.instructor.profile?.firstName || ''} ${cert.module.course.instructor.profile?.lastName || ''}`.trim(),
          } : null,
        } : {
          id: cert.course.id,
          title: cert.course.title,
          instructor: cert.course.instructor ? {
            id: cert.course.instructor.id,
            name: `${cert.course.instructor.profile?.firstName || ''} ${cert.course.instructor.profile?.lastName || ''}`.trim(),
          } : null,
        },
        module: isModuleCert ? {
          id: cert.module.id,
          title: cert.module.title,
        } : null,
      };
    });

    return NextResponse.json({
      success: true,
      certificates: transformedCertificates,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    });

  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only instructors and admins can generate certificates
    if (!["INSTRUCTOR", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, courseId, moduleId, certificateUrl } = body;

    if (!studentId || (!courseId && !moduleId) || !certificateUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify student exists
    const student = await prisma.profile.findUnique({
      where: { userId: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let certificate;

    if (courseId) {
      // Verify course access
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId: session.user.id,
        },
      });

      if (!course) {
        return NextResponse.json({ error: "Course not found or access denied" }, { status: 404 });
      }

      // Check if certificate already exists
      const existingCert = await prisma.certificate.findUnique({
        where: {
          studentId_courseId: {
            studentId: studentId,
            courseId: courseId,
          },
        },
      });

      if (existingCert) {
        return NextResponse.json({ error: "Certificate already exists for this student and course" }, { status: 400 });
      }

      // Create course certificate
      certificate = await prisma.certificate.create({
        data: {
          studentId: studentId,
          courseId: courseId,
          certificateUrl: certificateUrl,
        },
        include: {
          course: true,
          student: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else if (moduleId) {
      // Verify module access
      const moduleData = await prisma.courseModule.findFirst({
        where: {
          id: moduleId,
          course: {
            instructorId: session.user.id,
          },
        },
      });

      if (!moduleData) {
        return NextResponse.json({ error: "Module not found or access denied" }, { status: 404 });
      }

      // Check if certificate already exists
      const existingCert = await prisma.moduleCertificate.findUnique({
        where: {
          studentId_moduleId: {
            studentId: studentId,
            moduleId: moduleId,
          },
        },
      });

      if (existingCert) {
        return NextResponse.json({ error: "Certificate already exists for this student and module" }, { status: 400 });
      }

      // Create module certificate
      certificate = await prisma.moduleCertificate.create({
        data: {
          studentId: studentId,
          moduleId: moduleId,
          certificateUrl: certificateUrl,
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
      });
    }

    // Send notification to student
    try {
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: "CERTIFICATE_ISSUED",
          title: "¡Certificado Emitido!",
          message: `Se ha emitido un certificado para ${courseId ? 'el curso' : 'el módulo'} "${courseId ? certificate.course.title : certificate.module.title}"`,
          data: {
            certificateId: certificate.id,
            certificateType: courseId ? "course" : "module",
            courseId: courseId || certificate.module.courseId,
            moduleId: moduleId || certificate.module.id,
          },
        },
      });
    } catch (notificationError) {
      console.error("Error creating certificate notification:", notificationError);
      // Don't fail the certificate creation if notification fails
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
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}
