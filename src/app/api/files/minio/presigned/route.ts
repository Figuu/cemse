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

    const body = await request.json();
    const { bucket, key, expiry, operation = "get" } = body;

    if (!bucket || !key) {
      return NextResponse.json({ error: "Bucket and key parameters required" }, { status: 400 });
    }

    // Validate bucket
    const validBuckets = Object.values(BUCKETS);
    if (!validBuckets.includes(bucket)) {
      return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
    }

    let presignedUrl: string;

    if (operation === "upload") {
      presignedUrl = await minioService.getPresignedUploadUrl(bucket, key, expiry);
    } else {
      presignedUrl = await minioService.getPresignedUrl(bucket, key, expiry);
    }

    return NextResponse.json({
      success: true,
      presignedUrl,
      operation,
      bucket,
      key,
      expiry: expiry || (operation === "upload" ? 24 * 60 * 60 : 7 * 24 * 60 * 60)
    });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
