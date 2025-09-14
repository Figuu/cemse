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
    const { url, fileName, contentType, bucket } = body;

    if (!url || !fileName || !contentType) {
      return NextResponse.json(
        { error: "URL, fileName, and contentType are required" },
        { status: 400 }
      );
    }

    // Validate bucket
    const validBuckets = Object.values(BUCKETS);
    const targetBucket = bucket && validBuckets.includes(bucket) ? bucket : undefined;

    // Upload file from URL
    const result = await minioService.uploadFileFromUrl(
      url,
      fileName,
      contentType,
      targetBucket
    );

    return NextResponse.json({
      success: true,
      file: {
        url: result.url,
        bucket: result.bucket,
        key: result.key,
        originalName: fileName,
        type: contentType
      }
    });

  } catch (error) {
    console.error("Error uploading file from URL to MinIO:", error);
    return NextResponse.json(
      { error: "Failed to upload file from URL" },
      { status: 500 }
    );
  }
}
