import { NextRequest, NextResponse } from "next/server";
import { readdir, stat } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads", userId);
    
    try {
      const categories = await readdir(uploadDir);
      const files: Array<{
        id: string;
        name: string;
        type: string;
        size: number;
        url: string;
        uploadedAt: string;
        category: string;
        status: string;
      }> = [];

      for (const category of categories) {
        const categoryPath = join(uploadDir, category);
        const categoryStats = await stat(categoryPath);
        
        if (categoryStats.isDirectory()) {
          const categoryFiles = await readdir(categoryPath);
          
          for (const fileName of categoryFiles) {
            const filePath = join(categoryPath, fileName);
            const fileStats = await stat(filePath);
            
            // Parse filename to extract timestamp
            const timestamp = fileName.split('-')[0];
            const originalName = fileName.substring(timestamp.length + 1);
            
            files.push({
              id: `${userId}-${category}-${timestamp}`,
              name: originalName,
              type: getFileType(fileName),
              size: fileStats.size,
              url: `/uploads/${userId}/${category}/${fileName}`,
              uploadedAt: new Date(parseInt(timestamp)).toISOString(),
              category: category,
              status: "active"
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        files: files
      });

    } catch {
      // Directory doesn't exist or is empty
      return NextResponse.json({
        success: true,
        files: []
      });
    }

  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
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
