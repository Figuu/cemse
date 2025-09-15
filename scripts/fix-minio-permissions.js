const { Client } = require('minio');

// MinIO configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKETS = {
  UPLOADS: 'uploads',
  DOCUMENTS: 'documents', 
  IMAGES: 'images',
  VIDEOS: 'videos',
  AUDIO: 'audio',
  TEMP: 'temp'
};

async function fixMinIOPermissions() {
  try {
    console.log('🔧 Fixing MinIO bucket permissions...');
    
    for (const [bucketType, bucketName] of Object.entries(BUCKETS)) {
      console.log(`\n📦 Processing bucket: ${bucketName}`);
      
      try {
        // Check if bucket exists
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) {
          console.log(`   Creating bucket: ${bucketName}`);
          await minioClient.makeBucket(bucketName, 'us-east-1');
        }
        
        // Set public read policy
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
        
        console.log(`   Setting public read policy for: ${bucketName}`);
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        
        // Set CORS policy
        const corsConfig = {
          CORSRules: [
            {
              AllowedOrigins: ['*'],
              AllowedMethods: ['GET', 'HEAD', 'OPTIONS'],
              AllowedHeaders: ['*'],
              ExposeHeaders: ['ETag', 'Content-Length'],
              MaxAgeSeconds: 3000
            }
          ]
        };
        
        console.log(`   Setting CORS policy for: ${bucketName}`);
        await minioClient.setBucketCors(bucketName, corsConfig);
        
        // Test bucket access
        console.log(`   Testing access to: ${bucketName}`);
        try {
          const objects = await minioClient.listObjects(bucketName, '', true);
          let objectCount = 0;
          for await (const obj of objects) {
            objectCount++;
            if (objectCount <= 3) { // Show first 3 objects
              console.log(`     - ${obj.name} (${obj.size} bytes)`);
            }
          }
          console.log(`   ✅ Bucket ${bucketName} accessible (${objectCount} objects)`);
        } catch (listError) {
          console.log(`   ⚠️ Could not list objects in ${bucketName}: ${listError.message}`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error with bucket ${bucketName}:`, error.message);
      }
    }
    
    console.log('\n✅ MinIO permissions fix completed!');
    console.log('\n🎥 Testing specific video file access...');
    
    // Test the specific video file
    const videoBucket = 'videos';
    const videoKey = '1757906529772-ok5ng3ril3q.webm';
    
    try {
      const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${videoBucket}/${videoKey}`;
      console.log(`Testing URL: ${url}`);
      
      // Check if file exists
      try {
        await minioClient.statObject(videoBucket, videoKey);
        console.log('✅ Video file exists in MinIO');
        
        // Try to get the file
        const stream = await minioClient.getObject(videoBucket, videoKey);
        console.log('✅ Video file is accessible via MinIO client');
        
        // Test HTTP access
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`HTTP access test: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          console.log('✅ Video file is accessible via HTTP');
        } else {
          console.log('❌ Video file is NOT accessible via HTTP');
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        }
        
      } catch (statError) {
        console.log('❌ Video file does not exist in MinIO:', statError.message);
      }
      
    } catch (error) {
      console.error('❌ Error testing video access:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error fixing MinIO permissions:', error);
    process.exit(1);
  }
}

fixMinIOPermissions();
