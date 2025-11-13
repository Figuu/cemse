import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: certificateId } = await params;

    // Find certificate in database
    const certificate = await prisma.certificate.findUnique({
      where: { id: certificateId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        course: true,
      },
    });
    
    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Check if user is the certificate owner or has admin access
    const isOwner = certificate.student.userId === session.user.id;
    const isAdmin = ["SUPERADMIN", "INSTRUCTOR"].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get certificate URL from database
    const certificateUrl = certificate.fileUrl;

    if (!certificateUrl) {
      return NextResponse.json({ error: "Certificate file not found" }, { status: 404 });
    }

    try {
      // Fetch the certificate file from the stored URL (which is a proxy URL)
      const fileResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${certificateUrl}`);

      if (!fileResponse.ok) {
        return NextResponse.json({ error: "Certificate file not found" }, { status: 404 });
      }

      // Get the PDF blob
      const blob = await fileResponse.blob();
      const buffer = Buffer.from(await blob.arrayBuffer());

      // Return the PDF file as a download
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="certificado-${certificateId}.pdf"`,
          'Content-Length': buffer.length.toString(),
        },
      });
    } catch (error) {
      console.error("Error fetching certificate file:", error);
      return NextResponse.json({ error: "Failed to fetch certificate file" }, { status: 500 });
    }

  } catch (error) {
    console.error("Error downloading certificate:", error);
    return NextResponse.json(
      { error: "Failed to download certificate" },
      { status: 500 }
    );
  }
}
