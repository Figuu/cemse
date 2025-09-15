import { NextRequest, NextResponse } from "next/server";
import { minioService } from "@/lib/minioService";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket');
    const key = searchParams.get('key');
    
    if (!bucket || !key) {
      return NextResponse.json({ error: "Missing bucket or key parameter" }, { status: 400 });
    }

    // Get the file from MinIO
    const fileBuffer = await minioService.getFile(bucket, key);
    
    // Get file info to determine content type
    const fileInfo = await minioService.getFileInfo(bucket, key);
    
    // Return the file with proper headers
    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': fileInfo.metaData?.['content-type'] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'Content-Length': fileInfo.size.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving image from MinIO:", error);
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 });
  }
}

