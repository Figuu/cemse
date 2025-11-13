import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Fix certificate URLs that are direct MinIO URLs
 * Convert them to proxy URLs
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all certificates with MinIO direct URLs
    const certificates = await prisma.certificate.findMany({
      where: {
        fileUrl: {
          contains: ':9000/',
        },
      },
    });

    let fixed = 0;
    let errors = 0;

    for (const cert of certificates) {
      try {
        // Extract bucket and key from MinIO URL
        // Example: http://localhost:9000/certificates/course-certificates/courseId_studentId_timestamp.pdf
        const urlMatch = cert.fileUrl.match(/https?:\/\/[^\/]+\/([^\/]+)\/(.+)/);

        if (urlMatch) {
          const bucket = urlMatch[1];
          const key = urlMatch[2];
          const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`;

          await prisma.certificate.update({
            where: { id: cert.id },
            data: { fileUrl: proxyUrl },
          });

          fixed++;
        }
      } catch (err) {
        console.error(`Error fixing certificate ${cert.id}:`, err);
        errors++;
      }
    }

    // Also fix module certificates
    const moduleCertificates = await prisma.moduleCertificate.findMany({
      where: {
        fileUrl: {
          contains: ':9000/',
        },
      },
    });

    for (const cert of moduleCertificates) {
      try {
        const urlMatch = cert.fileUrl.match(/https?:\/\/[^\/]+\/([^\/]+)\/(.+)/);

        if (urlMatch) {
          const bucket = urlMatch[1];
          const key = urlMatch[2];
          const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`;

          await prisma.moduleCertificate.update({
            where: { id: cert.id },
            data: { fileUrl: proxyUrl },
          });

          fixed++;
        }
      } catch (err) {
        console.error(`Error fixing module certificate ${cert.id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      fixed,
      errors,
      message: `Fixed ${fixed} certificate URLs. ${errors} errors.`,
    });

  } catch (error) {
    console.error("Error fixing certificate URLs:", error);
    return NextResponse.json(
      { error: "Failed to fix certificate URLs" },
      { status: 500 }
    );
  }
}
