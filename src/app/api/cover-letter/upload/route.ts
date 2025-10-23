import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const templateName = formData.get("templateName") as string;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!templateName) {
      return NextResponse.json({ error: "No template name provided" }, { status: 400 });
    }

    if (!fileName) {
      return NextResponse.json({ error: "No file name provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ 
        error: "Invalid file type. Only PDF files are allowed." 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);

    const uniqueFileName = `cover-letters/${session.user.id}/${templateName}/${timestamp}-${randomString}-${fileName}`;

    console.log("Uploading Cover Letter to MinIO:", {
      userId: session.user.id,
      templateName,
      fileName,
      size: buffer.length,
      bucket: BUCKETS.DOCUMENTS
    });

    try {
      // Upload to MinIO
      const result = await minioService.uploadFile(
        buffer,
        uniqueFileName,
        'application/pdf',
        BUCKETS.DOCUMENTS
      );

      console.log("✅ Cover Letter uploaded successfully to MinIO:", result);

      // Generate proxy URL
      const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;

      // Update user profile with Cover Letter URL
      try {
        await prisma.profile.update({
          where: { userId: session.user.id },
          data: { coverLetterUrl: proxyUrl }
        });
        console.log("✅ Profile Cover Letter URL updated successfully");
      } catch (profileError) {
        console.error("❌ Failed to update profile Cover Letter URL:", profileError);
        // Don't fail the entire request if profile update fails
      }

      return NextResponse.json({
        success: true,
        file: {
          id: `${session.user.id}-cover-letter-${timestamp}`,
          name: fileName,
          type: file.type,
          size: file.size,
          url: proxyUrl,
          originalUrl: result.url,
          bucket: result.bucket,
          key: result.key,
          uploadedAt: new Date().toISOString(),
          templateName: templateName
        }
      });

    } catch (minioError) {
      console.error("❌ MinIO upload failed:", minioError);
      return NextResponse.json(
        { error: "Failed to upload Cover Letter to storage" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Cover Letter upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload Cover Letter" },
      { status: 500 }
    );
  }
}
