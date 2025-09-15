const { MinIOService } = require('../src/lib/minioService');

async function testVideoAccess() {
  try {
    console.log('🎥 Testing video file access...');
    
    const minioService = new MinIOService();
    
    // Test the specific video file from the error
    const bucket = 'videos';
    const key = '1757906529772-ok5ng3ril3q.webm';
    
    console.log(`Testing file: ${bucket}/${key}`);
    
    // Test if file exists in MinIO
    const exists = await minioService.fileExists(bucket, key);
    console.log(`File exists in MinIO: ${exists ? 'YES' : 'NO'}`);
    
    if (exists) {
      // Test if file is accessible via HTTP
      const isAccessible = await minioService.testFileAccess(bucket, key);
      console.log(`File accessible via HTTP: ${isAccessible ? 'YES' : 'NO'}`);
      
      if (!isAccessible) {
        console.log('\n🔧 Possible solutions:');
        console.log('1. Check if MinIO server is running');
        console.log('2. Check CORS configuration');
        console.log('3. Check bucket policy');
        console.log('4. Check network connectivity');
      }
    } else {
      console.log('\n❌ File not found in MinIO. Possible causes:');
      console.log('1. File upload failed');
      console.log('2. File was deleted');
      console.log('3. Wrong bucket or key');
    }
    
  } catch (error) {
    console.error('❌ Error testing video access:', error);
  }
}

testVideoAccess();
