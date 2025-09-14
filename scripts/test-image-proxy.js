const fetch = require('node-fetch');

async function testImageProxy() {
  try {
    console.log('🧪 Testing image proxy...');
    
    // Test with a sample image URL
    const testUrl = 'http://localhost:3000/api/images/proxy?bucket=images&key=test-image.jpg';
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      console.log('✅ Image proxy is working!');
      console.log(`📊 Response status: ${response.status}`);
      console.log(`📊 Content-Type: ${response.headers.get('content-type')}`);
    } else {
      console.log(`❌ Image proxy failed with status: ${response.status}`);
      const errorText = await response.text();
      console.log(`📝 Error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing image proxy:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testImageProxy();
}

module.exports = { testImageProxy };

