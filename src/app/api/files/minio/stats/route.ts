import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admin users to access statistics
    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket");

    let stats: any;

    if (bucket) {
      // Get stats for specific bucket
      const validBuckets = Object.values(BUCKETS);
      if (!validBuckets.includes(bucket)) {
        return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
      }

      const size = await minioService.getBucketSize(bucket);
      const files = await minioService.listFiles(bucket);
      
      stats = {
        bucket,
        size,
        fileCount: files.length,
        files: files.map(file => ({
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          etag: file.etag
        }))
      };
    } else {
      // Get stats for all buckets
      const bucketSizes = await minioService.getAllBucketSizes();
      const allStats: any = {};

      for (const bucketName of Object.values(BUCKETS)) {
        const files = await minioService.listFiles(bucketName);
        allStats[bucketName] = {
          size: bucketSizes[bucketName],
          fileCount: files.length
        };
      }

      stats = {
        buckets: allStats,
        totalSize: Object.values(bucketSizes).reduce((sum, size) => sum + size, 0),
        totalFiles: Object.values(allStats).reduce((sum: number, bucket: any) => sum + bucket.fileCount, 0)
      };
    }

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error("Error getting MinIO statistics:", error);
    return NextResponse.json(
      { error: "Failed to get statistics" },
      { status: 500 }
    );
  }
}
