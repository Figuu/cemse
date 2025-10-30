import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";

// Configuration for chunked uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

// Allow larger body size for base64 encoded files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, fileType, fileSize, fileData, category } = body;

    if (!fileName || !fileType || !fileData || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    console.log(`Chunked upload: ${fileName}, type: ${fileType}, size: ${fileSize} bytes`);

    // Validate file type based on category
    const allowedTypes = {
      "course-resource": [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-powerpoint",
        "application/zip",
        "application/x-zip-compressed",
        "text/plain",
        "image/png",
        "image/jpeg",
        "image/jpg"
      ],
    };

    const categoryTypes = allowedTypes[category as keyof typeof allowedTypes];
    if (!categoryTypes || !categoryTypes.includes(fileType)) {
      return NextResponse.json({
        error: `Invalid file type for ${category}. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT, Images`
      }, { status: 400 });
    }

    // Validate file size
    const maxSizes = {
      "course-resource": 20 * 1024 * 1024, // 20MB
    };

    const maxSize = maxSizes[category as keyof typeof maxSizes] || 10 * 1024 * 1024;
    if (fileSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({
        error: `File too large. Maximum size for ${category} is ${maxSizeMB}MB`
      }, { status: 400 });
    }

    // Convert base64 data URL to buffer
    const base64Data = fileData.split(',')[1];
    if (!base64Data) {
      return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Determine bucket based on category
    let bucket: string = BUCKETS.DOCUMENTS;
    if (category === "course-resource") {
      bucket = BUCKETS.DOCUMENTS;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileName.split('.').pop() || '';
    const uniqueFileName = `${category}/${session.user.id}/${timestamp}-${randomString}.${extension}`;

    try {
      console.log("Uploading to MinIO via chunked upload...");

      // Upload to MinIO
      const result = await minioService.uploadFile(
        fileBuffer,
        uniqueFileName,
        fileType,
        bucket
      );

      console.log("✅ Chunked upload successful:", result);

      // Generate proxy URL
      const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;

      return NextResponse.json({
        success: true,
        url: proxyUrl,
        file: {
          id: `${session.user.id}-${category}-${timestamp}`,
          name: fileName,
          type: fileType,
          size: fileSize,
          url: proxyUrl,
          originalUrl: result.url,
          bucket: result.bucket,
          key: result.key,
          uploadedAt: new Date().toISOString(),
          category: category
        }
      });
    } catch (minioError: any) {
      console.error("❌ MinIO upload failed, falling back to local storage:", minioError);

      // Fallback to local storage
      const fs = require('fs');
      const path = require('path');

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const localFileName = `${timestamp}-${randomString}.${extension}`;
      const localPath = path.join(uploadDir, localFileName);
      fs.writeFileSync(localPath, fileBuffer);

      const localUrl = `/uploads/${category}/${localFileName}`;

      return NextResponse.json({
        success: true,
        url: localUrl,
        file: {
          id: `${session.user.id}-${category}-${timestamp}`,
          name: fileName,
          type: fileType,
          size: fileSize,
          url: localUrl,
          bucket: 'local',
          key: localFileName,
          uploadedAt: new Date().toISOString(),
          category: category,
          fallback: true
        }
      });
    }
  } catch (error: any) {
    console.error("Chunked upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
