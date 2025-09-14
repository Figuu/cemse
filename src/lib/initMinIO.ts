import { minioService } from './minioService';

/**
 * Initialize MinIO service
 * This should be called during application startup
 */
export async function initializeMinIO(): Promise<void> {
  try {
    console.log('Initializing MinIO service...');
    await minioService.initializeBuckets();
    console.log('MinIO service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize MinIO service:', error);
    // Don't throw error to prevent app from crashing
    // MinIO might not be available in development
  }
}

/**
 * Check MinIO connection
 */
export async function checkMinIOConnection(): Promise<boolean> {
  try {
    await minioService.listFiles('uploads');
    return true;
  } catch (error) {
    console.error('MinIO connection failed:', error);
    return false;
  }
}
