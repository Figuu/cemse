import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uploadId, userId, category, originalName, originalSize, totalChunks } = body;

    if (!uploadId || !userId || !category || !originalName || !originalSize || !totalChunks) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Paths
    const chunksDir = join(process.cwd(), "public", "uploads", "chunks", userId, uploadId);
    const finalUploadDir = join(process.cwd(), "public", "uploads", userId, category);
    const metadataPath = join(chunksDir, "metadata.json");

    // Check if chunks directory exists
    if (!existsSync(chunksDir)) {
      return NextResponse.json({ error: "Upload session not found" }, { status: 404 });
    }

    // Read metadata
    const metadata = JSON.parse(await readFile(metadataPath, "utf-8"));

    // Verify all chunks are uploaded
    const uploadedChunks = metadata.chunks.filter((chunk: any) => chunk.uploaded);
    if (uploadedChunks.length !== totalChunks) {
      return NextResponse.json({ 
        error: `Incomplete upload. Expected ${totalChunks} chunks, got ${uploadedChunks.length}` 
      }, { status: 400 });
    }

    // Create final upload directory
    if (!existsSync(finalUploadDir)) {
      await mkdir(finalUploadDir, { recursive: true });
    }

    // Combine chunks into final file
    const timestamp = Date.now();
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const finalFilePath = join(finalUploadDir, fileName);

    // Read and combine all chunks
    const chunks = [];
    for (let i = 0; i < totalChunks; i++) {
      const chunkFileName = `chunk-${i.toString().padStart(4, '0')}`;
      const chunkPath = join(chunksDir, chunkFileName);
      
      if (!existsSync(chunkPath)) {
        return NextResponse.json({ 
          error: `Missing chunk ${i}` 
        }, { status: 400 });
      }

      const chunkData = await readFile(chunkPath);
      chunks.push(chunkData);
    }

    // Write combined file
    const finalBuffer = Buffer.concat(chunks);
    await writeFile(finalFilePath, finalBuffer);

    // Verify file size
    if (finalBuffer.length !== originalSize) {
      return NextResponse.json({ 
        error: `File size mismatch. Expected ${originalSize}, got ${finalBuffer.length}` 
      }, { status: 400 });
    }

    // Clean up chunks
    try {
      const chunkFiles = await readdir(chunksDir);
      for (const file of chunkFiles) {
        await unlink(join(chunksDir, file));
      }
      // Remove chunks directory
      await unlink(chunksDir);
    } catch (cleanupError) {
      console.warn("Failed to clean up chunks:", cleanupError);
      // Don't fail the upload if cleanup fails
    }

    // Return file information
    const fileUrl = `/uploads/${userId}/${category}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      file: {
        id: `${userId}-${category}-${timestamp}`,
        name: originalName,
        type: getFileType(originalName),
        size: originalSize,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        category: category
      },
      fileUrl
    });

  } catch (error) {
    console.error("Finalize upload error:", error);
    return NextResponse.json(
      { error: "Failed to finalize upload" },
      { status: 500 }
    );
  }
}

function getFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
}
