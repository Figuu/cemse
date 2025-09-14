// Client-side MinIO service that uses API routes
// This avoids importing MinIO directly in client components

export const BUCKETS = {
  UPLOADS: 'uploads',
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  TEMP: 'temp'
};

export interface MinIOObject {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
  isDir: boolean;
}

export interface MinIOBucket {
  name: string;
  creationDate: Date;
}

export class MinIOClientService {
  private baseUrl = '/api/files/minio';

  async listBuckets(): Promise<MinIOBucket[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=buckets`);
      if (!response.ok) {
        throw new Error('Failed to list buckets');
      }
      const data = await response.json();
      return data.buckets || [];
    } catch (error) {
      console.error('Error listing buckets:', error);
      throw error;
    }
  }

  async listObjects(bucket: string): Promise<MinIOObject[]> {
    try {
      const response = await fetch(`${this.baseUrl}?action=list&bucket=${encodeURIComponent(bucket)}`);
      if (!response.ok) {
        throw new Error('Failed to list objects');
      }
      const data = await response.json();
      return data.objects || [];
    } catch (error) {
      console.error('Error listing objects:', error);
      throw error;
    }
  }

  async uploadObject(bucket: string, objectName: string, file: File): Promise<void> {
    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          bucket,
          objectName,
          data: base64
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload object');
      }
    } catch (error) {
      console.error('Error uploading object:', error);
      throw error;
    }
  }

  async deleteObject(bucket: string, objectName: string): Promise<void> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          bucket,
          objectName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to delete object');
      }
    } catch (error) {
      console.error('Error deleting object:', error);
      throw error;
    }
  }

  async downloadObject(bucket: string, objectName: string): Promise<Blob> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'download',
          bucket,
          objectName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to download object');
      }

      const data = await response.json();
      const binaryString = atob(data.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes]);
    } catch (error) {
      console.error('Error downloading object:', error);
      throw error;
    }
  }

  getObjectUrl(bucket: string, objectName: string): string {
    // Return proxy URL for images, download URL for other files
    return `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(objectName)}`;
  }
}

// Export a singleton instance
export const minioClient = new MinIOClientService();
