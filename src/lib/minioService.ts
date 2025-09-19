import { Client, BucketItemStat, BucketItem, CopyConditions } from 'minio';
import { Readable } from 'stream';

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

// Bucket names
const BUCKETS = {
  UPLOADS: 'uploads',
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  TEMP: 'temp'
} as const;

// File type to bucket mapping
const FILE_TYPE_BUCKETS = {
  'image/': BUCKETS.IMAGES,
  'video/': BUCKETS.VIDEOS,
  'audio/': BUCKETS.AUDIO,
  'application/pdf': BUCKETS.DOCUMENTS,
  'application/msword': BUCKETS.DOCUMENTS,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': BUCKETS.DOCUMENTS,
  'application/vnd.ms-excel': BUCKETS.DOCUMENTS,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': BUCKETS.DOCUMENTS,
  'application/vnd.ms-powerpoint': BUCKETS.DOCUMENTS,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': BUCKETS.DOCUMENTS,
  'text/': BUCKETS.DOCUMENTS,
  'application/': BUCKETS.DOCUMENTS,
} as const;

export class MinIOService {
  private client: Client;

  constructor() {
    this.client = minioClient;
  }

  /**
   * Initialize MinIO buckets
   */
  async initializeBuckets(): Promise<void> {
    try {
      console.log('Initializing MinIO buckets...');
      
      for (const bucketName of Object.values(BUCKETS)) {
        try {
          const exists = await this.client.bucketExists(bucketName);
          if (!exists) {
            await this.client.makeBucket(bucketName, 'us-east-1');
            console.log(`✅ Created bucket: ${bucketName}`);
            
            // Set bucket policy to public read
            try {
              const policy = {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                  }
                ]
              };
              await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
              console.log(`✅ Set public policy for bucket: ${bucketName}`);
              
              // Note: CORS configuration is typically set at the MinIO server level
              // or through the MinIO Console. The client library doesn't provide
              // direct CORS configuration methods.
              console.log(`ℹ️ CORS policy should be configured at server level for bucket: ${bucketName}`);
            } catch (policyError) {
              console.warn(`⚠️ Could not set policy for bucket ${bucketName}:`, policyError.message);
            }
          } else {
            // Ensure existing buckets also have public read policy
            try {
              const policy = {
                Version: '2012-10-17',
                Statement: [
                  {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${bucketName}/*`]
                  }
                ]
              };
              await this.client.setBucketPolicy(bucketName, JSON.stringify(policy));
              console.log(`✅ Updated public policy for existing bucket: ${bucketName}`);
              
              // Note: CORS configuration is typically set at the MinIO server level
              // or through the MinIO Console. The client library doesn't provide
              // direct CORS configuration methods.
              console.log(`ℹ️ CORS policy should be configured at server level for existing bucket: ${bucketName}`);
            } catch (policyError) {
              console.warn(`⚠️ Could not update policy for existing bucket ${bucketName}:`, policyError.message);
            }
          }
        } catch (bucketError) {
          console.error(`❌ Error with bucket ${bucketName}:`, bucketError.message);
          throw bucketError;
        }
      }
      
      console.log('✅ All MinIO buckets initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing MinIO buckets:', error);
      throw error;
    }
  }

  /**
   * Upload a file to MinIO
   */
  async uploadFile(
    file: Buffer | Readable,
    fileName: string,
    contentType: string,
    bucket?: string
  ): Promise<{ url: string; bucket: string; key: string }> {
    try {
      // Determine bucket based on content type
      const targetBucket = bucket || this.getBucketForContentType(contentType);
      
      // Generate unique file name
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const extension = fileName.split('.').pop() || '';
      const uniqueFileName = `${timestamp}-${randomString}.${extension}`;
      
      // Upload file
      const fileSize = Buffer.isBuffer(file) ? file.length : undefined;
      await this.client.putObject(
        targetBucket,
        uniqueFileName,
        file,
        fileSize,
        {
          'Content-Type': contentType,
          'Cache-Control': 'max-age=31536000', // 1 year cache
        }
      );

      const url = `${process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`}/${targetBucket}/${uniqueFileName}`;
      
      return {
        url,
        bucket: targetBucket,
        key: uniqueFileName
      };
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw error;
    }
  }

  /**
   * Upload file from URL
   */
  async uploadFileFromUrl(
    url: string,
    fileName: string,
    contentType: string,
    bucket?: string
  ): Promise<{ url: string; bucket: string; key: string }> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      return await this.uploadFile(buffer, fileName, contentType, bucket);
    } catch (error) {
      console.error('Error uploading file from URL:', error);
      throw error;
    }
  }

  /**
   * Get file from MinIO
   */
  async getFile(bucket: string, key: string, start?: number, length?: number): Promise<Buffer> {
    try {
      const stream = await this.client.getObject(bucket, key, start, length);
      const chunks: Buffer[] = [];
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error getting file from MinIO:', error);
      throw error;
    }
  }

  /**
   * Get file stream from MinIO
   */
  async getFileStream(bucket: string, key: string): Promise<Readable> {
    try {
      return await this.client.getObject(bucket, key);
    } catch (error) {
      console.error('Error getting file stream from MinIO:', error);
      throw error;
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      await this.client.removeObject(bucket, key);
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      throw error;
    }
  }

  /**
   * Get file info from MinIO
   */
  async getFileInfo(bucket: string, key: string): Promise<BucketItemStat> {
    try {
      const stat = await this.client.statObject(bucket, key);
      return stat;
    } catch (error) {
      console.error('Error getting file info from MinIO:', error);
      throw error;
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, prefix?: string): Promise<BucketItem[]> {
    try {
      const objects: BucketItem[] = [];
      const stream = this.client.listObjects(bucket, prefix, true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => {
          // Convert ObjectInfo to BucketItem format
          const bucketItem: BucketItem = {
            name: obj.name || '',
            size: obj.size || 0,
            etag: obj.etag || '',
            lastModified: obj.lastModified || new Date()
          };
          objects.push(bucketItem);
        });
        stream.on('end', () => resolve(objects));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error listing files from MinIO:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for file access
   */
  async getPresignedUrl(
    bucket: string,
    key: string,
    expiry: number = 7 * 24 * 60 * 60 // 7 days
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(bucket, key, expiry);
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  /**
   * Generate presigned URL for file upload
   */
  async getPresignedUploadUrl(
    bucket: string,
    key: string,
    expiry: number = 24 * 60 * 60 // 1 day
  ): Promise<string> {
    try {
      return await this.client.presignedPutObject(bucket, key, expiry);
    } catch (error) {
      console.error('Error generating presigned upload URL:', error);
      throw error;
    }
  }

  /**
   * Copy file within MinIO
   */
  async copyFile(
    sourceBucket: string,
    sourceKey: string,
    destBucket: string,
    destKey: string
  ): Promise<void> {
    try {
      const copyConditions = new CopyConditions();
      await this.client.copyObject(
        destBucket,
        destKey,
        `${sourceBucket}/${sourceKey}`,
        copyConditions
      );
    } catch (error) {
      console.error('Error copying file in MinIO:', error);
      throw error;
    }
  }

  /**
   * Get bucket for content type
   */
  private getBucketForContentType(contentType: string): string {
    for (const [type, bucket] of Object.entries(FILE_TYPE_BUCKETS)) {
      if (contentType.startsWith(type)) {
        return bucket;
      }
    }
    return BUCKETS.UPLOADS;
  }

  /**
   * Get public URL for file
   */
  getPublicUrl(bucket: string, key: string): string {
    const baseUrl = process.env.MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
    return `${baseUrl}/${bucket}/${key}`;
  }

  /**
   * Test if a file is accessible
   */
  async testFileAccess(bucket: string, key: string): Promise<boolean> {
    try {
      const url = this.getPublicUrl(bucket, key);
      console.log(`Testing file access: ${url}`);
      
      const response = await fetch(url, { method: 'HEAD' });
      const isAccessible = response.ok;
      
      console.log(`File access test result: ${isAccessible ? 'SUCCESS' : 'FAILED'} (${response.status})`);
      
      if (!isAccessible) {
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      return isAccessible;
    } catch (error) {
      console.error('Error testing file access:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(bucket: string, key: string): Promise<boolean> {
    try {
      await this.client.statObject(bucket, key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get bucket size
   */
  async getBucketSize(bucket: string): Promise<number> {
    try {
      const objects = await this.listFiles(bucket);
      return objects.reduce((total, obj) => total + (obj.size || 0), 0);
    } catch (error) {
      console.error('Error getting bucket size:', error);
      return 0;
    }
  }

  /**
   * Get all bucket sizes
   */
  async getAllBucketSizes(): Promise<Record<string, number>> {
    const sizes: Record<string, number> = {};
    
    for (const bucketName of Object.values(BUCKETS)) {
      sizes[bucketName] = await this.getBucketSize(bucketName);
    }
    
    return sizes;
  }
}

// Export singleton instance
export const minioService = new MinIOService();

// Export bucket constants
export { BUCKETS };
