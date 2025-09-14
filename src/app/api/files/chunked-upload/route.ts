import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const userId = formData.get("userId") as string;
    const uploadId = formData.get("uploadId") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const originalName = formData.get("originalName") as string;
    const originalSize = parseInt(formData.get("originalSize") as string);

    if (!file || !category || !userId || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks)) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Validate file type based on category
    const allowedTypes = {
      "profile-picture": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
      "cv": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "certificate": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"],
      "other": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    };

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type for ${category}` 
      }, { status: 400 });
    }

    // Validate file size based on category
    const maxSizes = {
      "profile-picture": 5 * 1024 * 1024, // 5MB
      "cv": 10 * 1024 * 1024, // 10MB
      "certificate": 10 * 1024 * 1024, // 10MB
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
    const uploadDir = join(process.cwd(), "public", "uploads", "chunks", userId, uploadId);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save chunk
    const chunkFileName = `chunk-${chunkIndex.toString().padStart(4, '0')}`;
    const chunkPath = join(uploadDir, chunkFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(chunkPath, buffer);

    // Save metadata
    const metadataPath = join(uploadDir, "metadata.json");
    const metadata = {
      originalName,
      originalSize,
      totalChunks,
      category,
      uploadedAt: new Date().toISOString(),
      chunks: Array.from({ length: totalChunks }, (_, i) => ({
        index: i,
        uploaded: i <= chunkIndex,
        size: i === chunkIndex ? buffer.length : 0
      }))
    };

    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      chunkSize: buffer.length,
      uploadedChunks: chunkIndex + 1
    });

  } catch (error) {
    console.error("Chunked upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload chunk" },
      { status: 500 }
    );
  }
}
