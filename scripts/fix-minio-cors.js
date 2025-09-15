const { MinIOService } = require('../src/lib/minioService');

async function fixMinIOCORS() {
  try {
    console.log('🔧 Fixing MinIO CORS configuration...');
    
    const minioService = new MinIOService();
    await minioService.initializeBuckets();
    
    console.log('✅ MinIO CORS configuration updated successfully!');
    console.log('🎥 Videos should now be accessible from the browser.');
    
  } catch (error) {
    console.error('❌ Error fixing MinIO CORS:', error);
    process.exit(1);
  }
}

fixMinIOCORS();
