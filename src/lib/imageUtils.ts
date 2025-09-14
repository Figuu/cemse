/**
 * Utility functions for handling images in the application
 */

/**
 * Get the public URL for a MinIO image
 * This function handles both direct MinIO URLs and proxy URLs
 */
export function getImageUrl(thumbnailUrl: string | null | undefined): string | null {
  if (!thumbnailUrl) return null;
  
  // If it's already a proxy URL, return as is
  if (thumbnailUrl.includes('/api/images/proxy')) {
    return thumbnailUrl;
  }
  
  // If it's a MinIO URL, convert it to use our proxy
  if (thumbnailUrl.includes('localhost:9000') || thumbnailUrl.includes('minio')) {
    try {
      // Extract bucket and key from MinIO URL
      // Expected format: http://localhost:9000/bucket/key
      const url = new URL(thumbnailUrl);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        const bucket = pathParts[0];
        const key = pathParts.slice(1).join('/');
        return `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`;
      }
    } catch (error) {
      console.warn('Failed to parse MinIO URL:', thumbnailUrl, error);
    }
  }
  
  // For other URLs (like external images), return as is
  return thumbnailUrl;
}

/**
 * Get a placeholder image URL for courses without thumbnails
 */
export function getPlaceholderImageUrl(): string {
  return '/api/images/proxy?bucket=images&key=placeholder-course.jpg';
}

/**
 * Check if an image URL is from MinIO
 */
export function isMinIOUrl(url: string): boolean {
  return url.includes('localhost:9000') || url.includes('minio');
}
