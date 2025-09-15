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

    // Only allow super admins to initialize MinIO
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Super admin access required" }, { status: 403 });
    }

    console.log("Initializing MinIO buckets...");
    
    try {
      await minioService.initializeBuckets();
      
      return NextResponse.json({
        success: true,
        message: "MinIO buckets initialized successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("MinIO initialization failed:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to initialize MinIO buckets",
        details: error.message,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

  } catch (error) {
    console.error("MinIO init API error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process MinIO initialization request",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
