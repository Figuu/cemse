import { NextRequest, NextResponse } from "next/server";
import { minioService } from "@/lib/minioService";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bucket = searchParams.get('bucket');
  const key = searchParams.get('key');
  
  try {
    
    if (!bucket || !key) {
      return NextResponse.json({ error: "Missing bucket or key parameter" }, { status: 400 });
    }

    // Get file info first to determine content type and size
    const fileInfo = await minioService.getFileInfo(bucket, key);
    const fileSize = fileInfo.size;
    
    // Check for Range header (essential for video seeking)
    const range = request.headers.get('range');
    
    if (range) {
      // Parse range header (e.g., "bytes=0-1023")
      const match = range.match(/bytes=(\d+)-(\d*)/);
      if (!match) {
        return new NextResponse('Invalid Range header', { status: 416 });
      }
      
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse('Range Not Satisfiable', { 
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`,
          }
        });
      }
      
      // Get partial file from MinIO
      const fileBuffer = await minioService.getFile(bucket, key, start, end - start + 1);
      
      return new NextResponse(fileBuffer as any, {
        status: 206, // Partial Content
        headers: {
          'Content-Type': fileInfo.metaData?.['content-type'] || 'application/octet-stream',
          'Content-Length': (end - start + 1).toString(),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } else {
      // No range request - serve entire file
      const fileBuffer = await minioService.getFile(bucket, key);
      
      return new NextResponse(fileBuffer as any, {
        status: 200,
        headers: {
          'Content-Type': fileInfo.metaData?.['content-type'] || 'application/octet-stream',
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
  } catch (error) {
    console.error("Error serving file from MinIO:", error);
    console.error("Bucket:", bucket, "Key:", key);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({ 
      error: "Failed to serve file", 
      details: error.message,
      bucket,
      key 
    }, { status: 500 });
  }
}

