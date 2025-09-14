import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CertificateService } from "@/lib/certificateService";

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

    // Verify certificate and get download URL
    const verification = await CertificateService.verifyCertificate(certificateId);
    
    if (!verification.isValid || !verification.certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Check if user is the certificate owner or has admin access
    const isOwner = verification.student?.userId === session.user.id;
    const isAdmin = ["SUPERADMIN", "INSTRUCTOR"].includes(session.user.role);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get certificate download URL
    const downloadUrl = await CertificateService.getCertificateDownloadUrl(certificateId);
    
    if (!downloadUrl) {
      return NextResponse.json({ error: "Certificate file not found" }, { status: 404 });
    }

    // In a real implementation, you would:
    // 1. Generate the actual PDF certificate
    // 2. Return the PDF file as a response
    // For now, we'll return a redirect to the certificate URL
    
    return NextResponse.redirect(downloadUrl);

  } catch (error) {
    console.error("Error downloading certificate:", error);
    return NextResponse.json(
      { error: "Failed to download certificate" },
      { status: 500 }
    );
  }
}
