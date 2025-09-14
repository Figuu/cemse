const { MinIOService } = require('../src/lib/minioService');

async function initializeMinIO() {
  try {
    console.log('🚀 Initializing MinIO...');
    
    const minioService = new MinIOService();
    await minioService.initializeBuckets();
    
    console.log('✅ MinIO initialization completed successfully!');
    console.log('📝 Buckets created/verified:');
    console.log('   - uploads');
    console.log('   - documents');
    console.log('   - images');
    console.log('   - videos');
    console.log('   - audio');
    console.log('   - temp');
    console.log('');
    console.log('🔓 All buckets have public read access enabled');
    
  } catch (error) {
    console.error('❌ Failed to initialize MinIO:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeMinIO();
}

module.exports = { initializeMinIO };

