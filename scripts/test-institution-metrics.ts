import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testInstitutionMetrics() {
  try {
    console.log('Testing Institution Metrics...\n');

    // Get an institution (let's use the first one we find)
    const institution = await prisma.institution.findFirst({
      where: {
        isActive: true
      }
    });

    if (!institution) {
      console.log('No active institutions found in the database');
      return;
    }

    console.log(`Testing metrics for institution: ${institution.name} (${institution.id})\n`);

    // Get all profiles (students) for this institution
    const students = await prisma.profile.findMany({
      where: {
        institutionId: institution.id
      }
    });
    console.log(`Total students: ${students.length}`);

    // Get all courses for this institution
    const courses = await prisma.course.findMany({
      where: {
        institutionId: institution.id
      }
    });
    console.log(`Total courses: ${courses.length}`);

    // Get all companies (programs) for this institution
    const programs = await prisma.company.findMany({
      where: {
        institutionId: institution.id
      }
    });
    console.log(`Total programs/companies: ${programs.length}`);

    // Get all enrollments for students from this institution
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        student: {
          institutionId: institution.id
        }
      }
    });
    console.log(`Total enrollments: ${enrollments.length}`);

    // Test the analytics API endpoint
    console.log('\nTesting Analytics API Endpoint...');
    const response = await fetch(`http://localhost:3001/api/institutions/${institution.id}/analytics`);

    if (response.ok) {
      const analytics = await response.json();
      console.log('\nAnalytics API Response:');
      console.log('- Total Students:', analytics.overview?.totalStudents);
      console.log('- Total Courses:', analytics.overview?.totalCourses);
      console.log('- Total Programs:', analytics.overview?.totalPrograms);
      console.log('- Total Enrollments:', analytics.overview?.totalEnrollments);

      // Verify the numbers match
      console.log('\nVerification:');
      console.log(`Students match: ${analytics.overview?.totalStudents === students.length ? '✓' : '✗'}`);
      console.log(`Courses match: ${analytics.overview?.totalCourses === courses.length ? '✓' : '✗'}`);
      console.log(`Programs match: ${analytics.overview?.totalPrograms === programs.length ? '✓' : '✗'}`);
      console.log(`Enrollments match: ${analytics.overview?.totalEnrollments === enrollments.length ? '✓' : '✗'}`);
    } else {
      console.error('Failed to fetch analytics:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('Error testing institution metrics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInstitutionMetrics();