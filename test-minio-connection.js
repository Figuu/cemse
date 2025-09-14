const { Client } = require('minio');

async function testMinIOConnection() {
  console.log('🔍 Testing MinIO connection...');
  
  const minioClient = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
  });

  try {
    // Test connection
    console.log('⏳ Testing connection...');
    const buckets = await minioClient.listBuckets();
    console.log('✅ MinIO connection successful');
    console.log('📦 Available buckets:', buckets.map(b => b.name));

    // Test upload
    console.log('⏳ Testing file upload...');
    const testBuffer = Buffer.from('Hello MinIO!');
    const testFileName = `test-${Date.now()}.txt`;
    
    await minioClient.putObject('uploads', testFileName, testBuffer, testBuffer.length, {
      'Content-Type': 'text/plain',
    });
    
    console.log('✅ File upload successful');
    
    // Test file retrieval
    console.log('⏳ Testing file retrieval...');
    const fileStream = await minioClient.getObject('uploads', testFileName);
    const chunks = [];
    
    fileStream.on('data', chunk => chunks.push(chunk));
    fileStream.on('end', () => {
      const content = Buffer.concat(chunks).toString();
      console.log('✅ File retrieval successful:', content);
      
      // Clean up test file
      minioClient.removeObject('uploads', testFileName, (err) => {
        if (err) {
          console.log('⚠️ Could not clean up test file:', err.message);
        } else {
          console.log('✅ Test file cleaned up');
        }
      });
    });
    
    fileStream.on('error', (err) => {
      console.error('❌ File retrieval failed:', err.message);
    });

  } catch (error) {
    console.error('❌ MinIO test failed:', error.message);
    console.log('Make sure MinIO is running: docker-compose up -d');
  }
}

testMinIOConnection();
