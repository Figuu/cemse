import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

// Disable body size limit warnings for large file uploads
// Next.js App Router handles this differently than Pages Router
export const preferredRegion = 'auto';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const originalName = formData.get("originalName") as string;
    const originalSize = parseInt(formData.get("originalSize") as string);

    if (!file || !category || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log(`Receiving chunk ${chunkIndex + 1}/${totalChunks} for ${originalName}`);

    // Validate file type based on category
    const allowedTypes = {
      "course-thumbnail": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
      "course-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
      "course-audio": ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac", "audio/mpeg"],
      "profile-picture": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
      "cv": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "certificate": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"],
      "news-image": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
      "news-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
      "other": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac", "audio/mpeg"]
    };

    // Validate file size based on category
    const maxSizes = {
      "profile-picture": 5 * 1024 * 1024, // 5MB
      "cv": 10 * 1024 * 1024, // 10MB
      "certificate": 10 * 1024 * 1024, // 10MB
      "course-thumbnail": 10 * 1024 * 1024, // 10MB
      "course-video": 600 * 1024 * 1024, // 600MB
      "course-audio": 100 * 1024 * 1024, // 100MB
      "news-image": 10 * 1024 * 1024, // 10MB
      "news-video": 600 * 1024 * 1024, // 600MB
      "other": 10 * 1024 * 1024 // 10MB
    };

    const maxSize = maxSizes[category as keyof typeof maxSizes] || 10 * 1024 * 1024;
    if (originalSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({
        error: `File too large. Maximum size for ${category} is ${maxSizeMB}MB`
      }, { status: 400 });
    }

    // Create upload directory for chunks
    const uploadDir = join(process.cwd(), "public", "uploads", "chunks", session.user.id, uploadId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save chunk
    const chunkFileName = `chunk-${chunkIndex.toString().padStart(4, '0')}`;
    const chunkPath = join(uploadDir, chunkFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(chunkPath, buffer);

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} saved (${buffer.length} bytes)`);

    // Save/Update metadata
    const metadataPath = join(uploadDir, "metadata.json");
    let metadata: any = {
      originalName,
      originalSize,
      totalChunks,
      category,
      userId: session.user.id,
      uploadedAt: new Date().toISOString(),
      chunks: []
    };

    // Read existing metadata if it exists
    if (existsSync(metadataPath)) {
      const existingMetadata = await readFile(metadataPath, 'utf-8');
      metadata = JSON.parse(existingMetadata);
    }

    // Update chunks info
    if (!metadata.chunks) {
      metadata.chunks = [];
    }

    metadata.chunks[chunkIndex] = {
      index: chunkIndex,
      uploaded: true,
      size: buffer.length,
      uploadedAt: new Date().toISOString()
    };

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // Check if all chunks are uploaded
    const uploadedChunks = metadata.chunks.filter((c: any) => c && c.uploaded).length;
    const isComplete = uploadedChunks === totalChunks;

    if (isComplete) {
      console.log(`All chunks received for ${originalName}. Assembling file...`);

      try {
        // Assemble all chunks
        const chunks: Buffer[] = [];
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = join(uploadDir, `chunk-${i.toString().padStart(4, '0')}`);
          const chunkBuffer = await readFile(chunkPath);
          chunks.push(chunkBuffer);
        }

        const completeFile = Buffer.concat(chunks);
        console.log(`File assembled: ${completeFile.length} bytes`);

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
        const extension = originalName.split('.').pop() || '';
        const uniqueFileName = `${category}/${session.user.id}/${timestamp}-${randomString}.${extension}`;

        let fileUrl: string;
        let fileInfo: any;

        try {
          // Upload to MinIO
          console.log("Uploading assembled file to MinIO...");
          const result = await minioService.uploadFile(
            completeFile,
            uniqueFileName,
            file.type || 'application/octet-stream',
            bucket
          );

          console.log("✅ MinIO upload successful");
          const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;

          fileUrl = proxyUrl;
          fileInfo = {
            id: `${session.user.id}-${category}-${timestamp}`,
            name: originalName,
            type: file.type,
            size: completeFile.length,
            url: proxyUrl,
            originalUrl: result.url,
            bucket: result.bucket,
            key: result.key,
            uploadedAt: new Date().toISOString(),
            category: category
          };
        } catch (minioError: any) {
          console.error("MinIO upload failed, using local storage:", minioError);

          // Save locally as fallback
          const localDir = join(process.cwd(), "public", "uploads", category);
          if (!existsSync(localDir)) {
            await mkdir(localDir, { recursive: true });
          }

          const localFileName = `${timestamp}-${randomString}.${extension}`;
          const localPath = join(localDir, localFileName);
          await writeFile(localPath, completeFile);

          const localUrl = `/uploads/${category}/${localFileName}`;

          fileUrl = localUrl;
          fileInfo = {
            id: `${session.user.id}-${category}-${timestamp}`,
            name: originalName,
            type: file.type,
            size: completeFile.length,
            url: localUrl,
            bucket: 'local',
            key: localFileName,
            uploadedAt: new Date().toISOString(),
            category: category,
            fallback: true
          };
        }

        // Clean up chunks
        console.log("Cleaning up chunks...");
        for (let i = 0; i < totalChunks; i++) {
          const chunkPath = join(uploadDir, `chunk-${i.toString().padStart(4, '0')}`);
          if (existsSync(chunkPath)) {
            await unlink(chunkPath);
          }
        }
        await unlink(metadataPath);

        return NextResponse.json({
          success: true,
          complete: true,
          url: fileUrl,
          file: fileInfo
        });

      } catch (assemblyError: any) {
        console.error("Error assembling chunks:", assemblyError);
        return NextResponse.json(
          { error: "Failed to assemble uploaded chunks" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      complete: false,
      chunkIndex,
      totalChunks,
      uploadedChunks,
      progress: Math.round((uploadedChunks / totalChunks) * 100)
    });

  } catch (error: any) {
    console.error("Chunked upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload chunk" },
      { status: 500 }
    );
  }
}
