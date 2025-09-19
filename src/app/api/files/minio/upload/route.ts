import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "No category provided" }, { status: 400 });
    }

    // Validate file type based on category
    const allowedTypes = {
      "course-thumbnail": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
      "course-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
      "course-audio": ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac"],
      "news-image": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
      "news-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
      "profile-picture": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
      "cv": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "certificate": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"],
      "other": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac"]
    };

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      // Create a unique set of allowed extensions for this category
      const categoryTypes = allowedTypes[category as keyof typeof allowedTypes] || [];
      const extensions = new Set<string>();
      
      categoryTypes.forEach(type => {
        if (type.startsWith("image/")) {
          extensions.add("PNG, JPG, JPEG, GIF, WebP, SVG");
        } else if (type.startsWith("video/")) {
          extensions.add("MP4, AVI, MOV, WMV, FLV, WebM");
        } else if (type.startsWith("audio/")) {
          extensions.add("MP3, WAV, OGG, M4A, AAC, FLAC");
        } else if (type === "application/pdf") {
          extensions.add("PDF");
        } else if (type === "application/msword") {
          extensions.add("DOC");
        } else if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          extensions.add("DOCX");
        }
      });
      
      const allowedExtensions = Array.from(extensions).join(", ");
      
      return NextResponse.json({ 
        error: `Invalid file type for ${category}. Allowed types: ${allowedExtensions}` 
      }, { status: 400 });
    }

    // Validate file size based on category
    const maxSizes = {
      "profile-picture": 5 * 1024 * 1024, // 5MB
      "cv": 10 * 1024 * 1024, // 10MB
      "certificate": 10 * 1024 * 1024, // 10MB
      "course-thumbnail": 10 * 1024 * 1024, // 10MB
      "course-video": 500 * 1024 * 1024, // 500MB
      "course-audio": 100 * 1024 * 1024, // 100MB
      "news-image": 10 * 1024 * 1024, // 10MB
      "news-video": 500 * 1024 * 1024, // 500MB
      "other": 10 * 1024 * 1024 // 10MB
    };

    const maxSize = maxSizes[category as keyof typeof maxSizes] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({ 
        error: `File too large. Maximum size for ${category} is ${maxSizeMB}MB` 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine bucket based on category
    let bucket: string = BUCKETS.UPLOADS;
    if (category === "course-thumbnail" || category === "profile-picture" || category === "certificate" || category === "news-image") {
      bucket = BUCKETS.IMAGES;
    } else if (category === "course-video" || category === "news-video") {
      bucket = BUCKETS.VIDEOS;
    } else if (category === "course-audio") {
      bucket = BUCKETS.AUDIO;
    } else if (category === "cv") {
      bucket = BUCKETS.DOCUMENTS;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || '';
    const uniqueFileName = `${category}/${session.user.id}/${timestamp}-${randomString}.${extension}`;

    try {
      // Check MinIO connection first
      console.log("Attempting MinIO upload...");
      console.log("MinIO Config:", {
        endpoint: process.env.MINIO_ENDPOINT,
        port: process.env.MINIO_PORT,
        accessKey: process.env.MINIO_ACCESS_KEY,
        useSSL: process.env.MINIO_USE_SSL
      });
      console.log("Target bucket:", bucket);
      console.log("File info:", {
        name: file.name,
        type: file.type,
        size: file.size,
        category: category
      });

      // Test MinIO connection first
      try {
        await minioService.listFiles(bucket);
        console.log("✅ MinIO connection test successful");
      } catch (connectionError) {
        console.error("❌ MinIO connection test failed:", connectionError.message);
        throw new Error(`MinIO connection failed: ${connectionError.message}`);
      }

      // Try to upload to MinIO
      const result = await minioService.uploadFile(
        buffer,
        uniqueFileName,
        file.type,
        bucket
      );

      console.log("✅ MinIO upload successful:", result);
      
      // Generate proxy URL instead of direct MinIO URL
      const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;
      
      return NextResponse.json({
        success: true,
        file: {
          id: `${session.user.id}-${category}-${timestamp}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: proxyUrl,
          originalUrl: result.url, // Keep original URL for reference
          bucket: result.bucket,
          key: result.key,
          uploadedAt: new Date().toISOString(),
          category: category
        }
      });
    } catch (minioError) {
      console.error("❌ MinIO upload failed, falling back to local storage:", minioError);
      console.error("MinIO Error Details:", {
        message: minioError.message,
        code: minioError.code,
        stack: minioError.stack
      });
      
      // Fallback to local storage
      const fs = require('fs');
      const path = require('path');
      
      // Create directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Save file locally
      const localFileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${file.name.split('.').pop()}`;
      const localPath = path.join(uploadDir, localFileName);
      fs.writeFileSync(localPath, buffer);
      
      // Generate local URL
      const localUrl = `/uploads/${category}/${localFileName}`;
      
      return NextResponse.json({
        success: true,
        file: {
          id: `${session.user.id}-${category}-${timestamp}`,
          name: file.name,
          type: file.type,
          size: file.size,
          url: localUrl,
          bucket: 'local',
          key: localFileName,
          uploadedAt: new Date().toISOString(),
          category: category,
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error("MinIO upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file to MinIO" },
      { status: 500 }
    );
  }
}
