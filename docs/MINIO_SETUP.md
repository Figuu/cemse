# MinIO Setup Guide

This guide explains how to set up MinIO for file storage in the CEMSE application.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_PUBLIC_URL="http://localhost:9000"
```

### Production Configuration

For production, use secure credentials and HTTPS:

```env
# MinIO Production Configuration
MINIO_ENDPOINT="minio.yourdomain.com"
MINIO_PORT="443"
MINIO_USE_SSL="true"
MINIO_ACCESS_KEY="your-secure-access-key"
MINIO_SECRET_KEY="your-secure-secret-key"
MINIO_PUBLIC_URL="https://minio.yourdomain.com"
```

## Local Development Setup

### Option 1: Docker Compose

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'
services:
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  minio_data:
```

Run with: `docker-compose up -d`

### Option 2: Direct Installation

1. Download MinIO from https://min.io/download
2. Run MinIO server:
   ```bash
   minio server /path/to/data --console-address ":9001"
   ```
3. Access MinIO Console at http://localhost:9001
4. Login with `minioadmin` / `minioadmin`

## Bucket Structure

The application automatically creates the following buckets:

- `uploads` - General file uploads
- `documents` - PDFs, Word docs, Excel files, etc.
- `images` - Image files (JPG, PNG, GIF, etc.)
- `videos` - Video files (MP4, AVI, MOV, etc.)
- `audio` - Audio files (MP3, WAV, etc.)
- `temp` - Temporary files

## Features

### File Upload
- Automatic file type detection and bucket assignment
- Chunked upload support for large files
- Progress tracking
- File validation

### File Management
- List files by bucket
- Search and filter files
- Delete files
- Generate presigned URLs for secure access

### Statistics
- Bucket size monitoring
- File count tracking
- Storage usage analytics

## API Endpoints

### Upload File
```
POST /api/files/minio
Content-Type: multipart/form-data

Form data:
- file: File to upload
- bucket: (optional) Target bucket
- fileName: (optional) Custom file name
```

### Upload from URL
```
POST /api/files/minio/upload-from-url
Content-Type: application/json

{
  "url": "https://example.com/file.pdf",
  "fileName": "document.pdf",
  "contentType": "application/pdf",
  "bucket": "documents"
}
```

### List Files
```
GET /api/files/minio?bucket=uploads&prefix=images/
```

### Delete File
```
DELETE /api/files/minio?bucket=uploads&key=filename.pdf
```

### Generate Presigned URL
```
POST /api/files/minio/presigned
Content-Type: application/json

{
  "bucket": "uploads",
  "key": "filename.pdf",
  "expiry": 3600,
  "operation": "get"
}
```

### Get Statistics
```
GET /api/files/minio/stats
GET /api/files/minio/stats?bucket=uploads
```

## Security

- All API endpoints require authentication
- Statistics endpoint requires SUPERADMIN role
- Presigned URLs have configurable expiry times
- File access is controlled by bucket permissions

## Integration

The MinIO service is integrated with:

- File upload components
- CV builder (PDF generation)
- Resource management
- Content management system
- Profile file uploads

## Troubleshooting

### Connection Issues
1. Verify MinIO server is running
2. Check environment variables
3. Ensure network connectivity
4. Verify credentials

### Permission Issues
1. Check MinIO bucket policies
2. Verify access keys
3. Ensure proper authentication

### Performance Issues
1. Monitor MinIO server resources
2. Check network latency
3. Consider CDN integration for public files
4. Optimize file sizes

## Production Considerations

1. **Security**: Use strong access keys and enable HTTPS
2. **Backup**: Implement regular backups of MinIO data
3. **Monitoring**: Set up monitoring for MinIO server health
4. **Scaling**: Consider MinIO clustering for high availability
5. **CDN**: Use CDN for better file delivery performance
6. **Lifecycle**: Implement lifecycle policies for file retention
