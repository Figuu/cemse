import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllInstitutions() {
  try {
    console.log('Checking all institutions and their courses...\n');

    // Get all institutions
    const institutions = await prisma.institution.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        institutionType: true
      }
    });

    console.log(`Found ${institutions.length} active institutions\n`);

    for (const institution of institutions) {
      // Count courses for each institution
      const courseCount = await prisma.course.count({
        where: {
          institutionId: institution.id
        }
      });

      // Count students for each institution
      const studentCount = await prisma.profile.count({
        where: {
          institutionId: institution.id
        }
      });

      console.log(`${institution.name} (${institution.institutionType}):`);
      console.log(`  - ID: ${institution.id}`);
      console.log(`  - Courses: ${courseCount}`);
      console.log(`  - Students: ${studentCount}`);
      console.log('');
    }

    // Check total courses in the system
    const totalCourses = await prisma.course.count();
    console.log(`\nTotal courses in the system: ${totalCourses}`);

  } catch (error) {
    console.error('Error checking institutions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllInstitutions();