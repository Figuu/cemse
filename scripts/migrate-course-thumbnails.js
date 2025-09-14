const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Convert MinIO URL to proxy URL
 */
function convertToProxyUrl(url) {
  if (!url) return null;
  
  // If it's already a proxy URL, return as is
  if (url.includes('/api/images/proxy')) {
    return url;
  }
  
  // If it's a MinIO URL, convert it to use our proxy
  if (url.includes('localhost:9000') || url.includes('minio')) {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      
      if (pathParts.length >= 2) {
        const bucket = pathParts[0];
        const key = pathParts.slice(1).join('/');
        return `/api/images/proxy?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(key)}`;
      }
    } catch (error) {
      console.warn('Failed to parse MinIO URL:', url, error.message);
    }
  }
  
  // For other URLs, return as is
  return url;
}

async function migrateCourseThumbnails() {
  try {
    console.log('🔄 Starting course thumbnail migration...');
    
    // Get all courses with thumbnails
    const courses = await prisma.course.findMany({
      where: {
        thumbnail: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        thumbnail: true
      }
    });
    
    console.log(`📊 Found ${courses.length} courses with thumbnails`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const course of courses) {
      const originalUrl = course.thumbnail;
      const proxyUrl = convertToProxyUrl(originalUrl);
      
      if (proxyUrl !== originalUrl) {
        await prisma.course.update({
          where: { id: course.id },
          data: { thumbnail: proxyUrl }
        });
        
        console.log(`✅ Updated: ${course.title}`);
        console.log(`   From: ${originalUrl}`);
        console.log(`   To:   ${proxyUrl}`);
        updatedCount++;
      } else {
        console.log(`⏭️  Skipped: ${course.title} (already using proxy or external URL)`);
        skippedCount++;
      }
    }
    
    console.log('\n📈 Migration Summary:');
    console.log(`   Updated: ${updatedCount} courses`);
    console.log(`   Skipped: ${skippedCount} courses`);
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  migrateCourseThumbnails();
}

module.exports = { migrateCourseThumbnails };

