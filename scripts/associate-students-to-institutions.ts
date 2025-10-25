import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function associateStudentsToInstitutions() {
  try {
    console.log('🔗 Asociando estudiantes a instituciones...');

    // Obtener todas las instituciones
    const institutions = await prisma.institution.findMany({
      where: { isActive: true },
    });

    if (institutions.length === 0) {
      console.log('❌ No hay instituciones activas en la base de datos');
      return;
    }

    // Obtener todos los perfiles de jóvenes que no tienen institución asignada
    const youthProfiles = await prisma.profile.findMany({
      where: {
        user: {
          role: 'YOUTH',
        },
        institutionId: null,
      },
      include: {
        user: true,
      },
    });

    console.log(`📊 Encontrados ${youthProfiles.length} estudiantes sin institución`);
    console.log(`🏢 Encontradas ${institutions.length} instituciones activas`);

    // Asociar estudiantes a instituciones de manera distribuida
    let associatedCount = 0;
    for (let i = 0; i < youthProfiles.length; i++) {
      const profile = youthProfiles[i];
      const institution = institutions[i % institutions.length];
      
      await prisma.profile.update({
        where: { id: profile.id },
        data: {
          institutionId: institution.id,
          currentInstitution: institution.name,
        },
      });
      
      associatedCount++;
      console.log(`✅ Estudiante ${profile.firstName} ${profile.lastName} asociado a ${institution.name}`);
    }

    console.log(`🎉 Se asociaron ${associatedCount} estudiantes a instituciones`);

    // Verificar las métricas
    console.log('\n📈 Verificando métricas por institución:');
    for (const institution of institutions) {
      const studentCount = await prisma.profile.count({
        where: {
          institutionId: institution.id,
          user: { role: 'YOUTH' },
        },
      });

      const courseCount = await prisma.course.count({
        where: { institutionId: institution.id },
      });

      const companyCount = await prisma.company.count({
        where: { institutionId: institution.id },
      });

      console.log(`🏢 ${institution.name}:`);
      console.log(`   👥 Estudiantes: ${studentCount}`);
      console.log(`   📚 Cursos: ${courseCount}`);
      console.log(`   🏭 Empresas: ${companyCount}`);
    }

  } catch (error) {
    console.error('❌ Error asociando estudiantes a instituciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

associateStudentsToInstitutions();
