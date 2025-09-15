import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService } from "@/lib/minioService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const contentType = formData.get("contentType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size based on content type
    const maxSizes = {
      "video/": 500 * 1024 * 1024, // 500MB
      "audio/": 100 * 1024 * 1024, // 100MB
      "image/": 10 * 1024 * 1024,  // 10MB
      "text/": 5 * 1024 * 1024,    // 5MB
      "application/": 5 * 1024 * 1024, // 5MB
    };

    const fileType = Object.keys(maxSizes).find(type => file.type.startsWith(type));
    const maxSize = fileType ? maxSizes[fileType as keyof typeof maxSizes] : 5 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to MinIO
    console.log("Uploading file to MinIO:", {
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
      bufferSize: buffer.length
    });

    const result = await minioService.uploadFile(
      buffer,
      file.name,
      file.type
    );

    console.log("MinIO upload result:", result);

    return NextResponse.json({
      success: true,
      url: result.url,
      bucket: result.bucket,
      key: result.key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
