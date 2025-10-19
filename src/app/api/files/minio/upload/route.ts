import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { minioService, BUCKETS } from "@/lib/minioService";
import busboy from "busboy";
import { Readable } from "stream";

// Configuración para permitir archivos grandes (hasta 600MB para videos)
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutos de timeout
export const dynamic = 'force-dynamic';

// Función helper para convertir ReadableStream a Node.js Stream
function readableStreamToNodeStream(readableStream: ReadableStream): Readable {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (error) {
        this.destroy(error as Error);
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convertir el body a Node.js stream
    if (!request.body) {
      return NextResponse.json({ error: "No request body" }, { status: 400 });
    }

    const nodeStream = readableStreamToNodeStream(request.body);

    // Obtener el content-type header
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: "Content-Type must be multipart/form-data" }, { status: 400 });
    }

    // Parsear el multipart/form-data con busboy
    return new Promise<NextResponse>((resolve) => {
      const bb = busboy({
        headers: {
          'content-type': contentType
        },
        limits: {
          fileSize: 600 * 1024 * 1024, // 600MB
          files: 1
        }
      });

      let fileBuffer: Buffer | null = null;
      let fileName = '';
      let fileType = '';
      let fileSize = 0;
      let category = '';
      const chunks: Buffer[] = [];

      // Evento cuando se recibe un campo de texto
      bb.on('field', (name, val) => {
        if (name === 'category') {
          category = val;
        }
      });

      // Evento cuando se recibe un archivo
      bb.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        fileName = filename;
        fileType = mimeType;

        console.log(`Receiving file: ${filename}, type: ${mimeType}`);

        file.on('data', (data: Buffer) => {
          chunks.push(data);
          fileSize += data.length;
        });

        file.on('end', () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`File received: ${filename}, size: ${fileSize} bytes`);
        });

        file.on('limit', () => {
          resolve(NextResponse.json({
            error: "File too large. Maximum size is 600MB"
          }, { status: 413 }));
        });
      });

      // Evento cuando termina el parsing
      bb.on('finish', async () => {
        try {
          if (!fileBuffer) {
            resolve(NextResponse.json({ error: "No file provided" }, { status: 400 }));
            return;
          }

          if (!category) {
            resolve(NextResponse.json({ error: "No category provided" }, { status: 400 }));
            return;
          }

          // Validate file type based on category
          const allowedTypes = {
            "course-thumbnail": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
            "course-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
            "course-audio": ["audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac", "audio/mpeg"],
            "news-image": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "image/svg+xml"],
            "news-video": ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/flv", "video/webm", "video/quicktime"],
            "profile-picture": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"],
            "cv": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            "certificate": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf"],
            "other": ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac", "audio/flac", "audio/mpeg"]
          };

          if (!allowedTypes[category as keyof typeof allowedTypes]?.includes(fileType)) {
            const categoryTypes = allowedTypes[category as keyof typeof allowedTypes] || [];
            const extensions = new Set<string>();

            categoryTypes.forEach(type => {
              if (type.startsWith("image/")) {
                extensions.add("PNG, JPG, JPEG, GIF, WebP, SVG");
              } else if (type.startsWith("video/")) {
                extensions.add("MP4, AVI, MOV, WMV, FLV, WebM");
              } else if (type.startsWith("audio/")) {
                extensions.add("MP3, WAV, OGG, M4A, AAC, FLAC");
              } else if (type === "application/pdf") {
                extensions.add("PDF");
              } else if (type === "application/msword") {
                extensions.add("DOC");
              } else if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                extensions.add("DOCX");
              }
            });

            const allowedExtensions = Array.from(extensions).join(", ");

            resolve(NextResponse.json({
              error: `Invalid file type for ${category}. Allowed types: ${allowedExtensions}`
            }, { status: 400 }));
            return;
          }

          // Validate file size based on category
          const maxSizes = {
            "profile-picture": 5 * 1024 * 1024, // 5MB
            "cv": 10 * 1024 * 1024, // 10MB
            "certificate": 10 * 1024 * 1024, // 10MB
            "course-thumbnail": 10 * 1024 * 1024, // 10MB
            "course-video": 500 * 1024 * 1024, // 500MB
            "course-audio": 100 * 1024 * 1024, // 100MB
            "news-image": 10 * 1024 * 1024, // 10MB
            "news-video": 500 * 1024 * 1024, // 500MB
            "other": 10 * 1024 * 1024 // 10MB
          };

          const maxSize = maxSizes[category as keyof typeof maxSizes] || 10 * 1024 * 1024;
          if (fileSize > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            resolve(NextResponse.json({
              error: `File too large. Maximum size for ${category} is ${maxSizeMB}MB`
            }, { status: 400 }));
            return;
          }

          // Determine bucket based on category
          let bucket: string = BUCKETS.UPLOADS;
          if (category === "course-thumbnail" || category === "profile-picture" || category === "certificate" || category === "news-image") {
            bucket = BUCKETS.IMAGES;
          } else if (category === "course-video" || category === "news-video") {
            bucket = BUCKETS.VIDEOS;
          } else if (category === "course-audio") {
            bucket = BUCKETS.AUDIO;
          } else if (category === "cv") {
            bucket = BUCKETS.DOCUMENTS;
          }

          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const extension = fileName.split('.').pop() || '';
          const uniqueFileName = `${category}/${session.user.id}/${timestamp}-${randomString}.${extension}`;

          try {
            // Check MinIO connection first
            console.log("Attempting MinIO upload...");
            console.log("File info:", {
              name: fileName,
              type: fileType,
              size: fileSize,
              category: category
            });

            // Test MinIO connection first
            try {
              await minioService.listFiles(bucket);
              console.log("✅ MinIO connection test successful");
            } catch (connectionError: any) {
              console.error("❌ MinIO connection test failed:", connectionError.message);
              throw new Error(`MinIO connection failed: ${connectionError.message}`);
            }

            // Try to upload to MinIO
            const result = await minioService.uploadFile(
              fileBuffer,
              uniqueFileName,
              fileType,
              bucket
            );

            console.log("✅ MinIO upload successful:", result);

            // Generate proxy URL instead of direct MinIO URL
            const proxyUrl = `/api/images/proxy?bucket=${encodeURIComponent(result.bucket)}&key=${encodeURIComponent(result.key)}`;

            resolve(NextResponse.json({
              success: true,
              url: proxyUrl, // Add url at root level for compatibility
              file: {
                id: `${session.user.id}-${category}-${timestamp}`,
                name: fileName,
                type: fileType,
                size: fileSize,
                url: proxyUrl,
                originalUrl: result.url,
                bucket: result.bucket,
                key: result.key,
                uploadedAt: new Date().toISOString(),
                category: category
              }
            }));
          } catch (minioError: any) {
            console.error("❌ MinIO upload failed, falling back to local storage:", minioError);

            // Fallback to local storage
            const fs = require('fs');
            const path = require('path');

            // Create directory if it doesn't exist
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', category);
            if (!fs.existsSync(uploadDir)) {
              fs.mkdirSync(uploadDir, { recursive: true });
            }

            // Save file locally
            const localFileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
            const localPath = path.join(uploadDir, localFileName);
            fs.writeFileSync(localPath, fileBuffer);

            // Generate local URL
            const localUrl = `/uploads/${category}/${localFileName}`;

            resolve(NextResponse.json({
              success: true,
              url: localUrl, // Add url at root level for compatibility
              file: {
                id: `${session.user.id}-${category}-${timestamp}`,
                name: fileName,
                type: fileType,
                size: fileSize,
                url: localUrl,
                bucket: 'local',
                key: localFileName,
                uploadedAt: new Date().toISOString(),
                category: category,
                fallback: true
              }
            }));
          }
        } catch (error: any) {
          console.error("Error processing file:", error);
          resolve(NextResponse.json(
            { error: "Failed to process file upload" },
            { status: 500 }
          ));
        }
      });

      // Evento de error
      bb.on('error', (error: any) => {
        console.error("Busboy error:", error);
        resolve(NextResponse.json(
          { error: "Failed to parse file upload" },
          { status: 500 }
        ));
      });

      // Pipe el stream a busboy
      nodeStream.pipe(bb);
    });

  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
