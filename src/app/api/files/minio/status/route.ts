import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService } from "@/lib/minioService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check MinIO configuration
    const config = {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT || '9000',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      useSSL: process.env.MINIO_USE_SSL === 'true',
      publicUrl: process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`
    };

    // Test MinIO connection
    let connectionStatus = "unknown";
    let error = null;
    
    try {
      await minioService.listFiles('uploads');
      connectionStatus = "connected";
    } catch (err) {
      connectionStatus = "failed";
      error = {
        message: err.message,
        code: err.code,
        name: err.name
      };
    }

    return NextResponse.json({
      status: connectionStatus,
      config,
      error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("MinIO status check error:", error);
    return NextResponse.json(
      { 
        status: "error",
        error: "Failed to check MinIO status",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
