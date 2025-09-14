import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;
    const userId = formData.get("userId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: "No category provided" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "No user ID provided" }, { status: 400 });
    }

    // Validate file type based on category
    const allowedTypes = {
      "profile-picture": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
      "cv": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      "certificate": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"],
      "course-thumbnail": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
      "course-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
      "other": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    };

    if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(file.type)) {
      const allowedExtensions = allowedTypes[category as keyof typeof allowedTypes]?.map(type => {
        if (type.startsWith("image/")) return "PNG, JPG, JPEG, GIF, WebP";
        if (type === "application/pdf") return "PDF";
        if (type === "application/msword") return "DOC";
        if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return "DOCX";
        return type;
      }).join(", ");
      
      return NextResponse.json({ 
        error: `Invalid file type for ${category}. Allowed types: ${allowedExtensions}` 
      }, { status: 400 });
    }

    // Validate file size based on category
    const maxSizes = {
      "profile-picture": 5 * 1024 * 1024, // 5MB
      "cv": 10 * 1024 * 1024, // 10MB
      "certificate": 10 * 1024 * 1024, // 10MB
      "course-thumbnail": 10 * 1024 * 1024, // 10MB
      "course-video": 500 * 1024 * 1024, // 500MB
      "other": 10 * 1024 * 1024 // 10MB
    };

    const maxSize = maxSizes[category as keyof typeof maxSizes] || 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json({ 
        error: `File too large. Maximum size for ${category} is ${maxSizeMB}MB` 
      }, { status: 400 });
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", userId, category);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return file information
    const fileUrl = `/uploads/${userId}/${category}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      file: {
        id: `${userId}-${category}-${timestamp}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        category: category
      }
    });

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");
    const userId = searchParams.get("userId");

    if (!fileId || !userId) {
      return NextResponse.json({ error: "Missing file ID or user ID" }, { status: 400 });
    }

    // Parse file ID to get category and timestamp
    const [userIdFromId, category, timestamp] = fileId.split('-');
    
    if (userIdFromId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the actual file by scanning the directory
    const categoryDir = join(process.cwd(), "public", "uploads", userId, category);
    
    try {
      const files = await readdir(categoryDir);
      const targetFile = files.find(file => file.startsWith(timestamp));
      
      if (!targetFile) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      // Delete the file
      const filePath = join(categoryDir, targetFile);
      await unlink(filePath);
      
      return NextResponse.json({
        success: true,
        message: "File deleted successfully"
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("File deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
