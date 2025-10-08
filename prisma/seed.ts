import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Create super admin user
  const adminPassword = await bcrypt.hash('12345678', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: adminPassword,
      role: 'SUPERADMIN',
      isActive: true,
      profile: {
        create: {
          firstName: 'Administrador',
          lastName: 'Sistema',
          profileCompletion: 100,
          status: 'ACTIVE',
        },
      },
    },
    include: {
      profile: true,
    },
  });

  //seed?
  console.log('✅ Usuario administrador creado:', admin.email);

  // Create sample institution
  // const institutionPassword = await bcrypt.hash('12345678', 12);
  // const institution = await prisma.user.upsert({
  //   where: { email: 'insti@demo.com' },
  //   update: {},
  //   create: {
  //     email: 'insti@demo.com',
  //     password: institutionPassword,
  //     role: 'INSTITUTION',
  //     isActive: true,
  //     profile: {
  //       create: {
  //         firstName: 'Institución',
  //         lastName: 'Ejemplo',
  //         profileCompletion: 80,
  //         status: 'ACTIVE',
  //       },
  //     },
  //   },
  //   include: {
  //     profile: true,
  //   },
  // });

  // const institutionData = await prisma.institution.upsert({
  //   where: {
  //     name_department: {
  //       name: 'Fundación CEMSE',
  //       department: 'Cochabamba'
  //     }
  //   },
  //   update: {},
  //   create: {
  //     name: 'Fundación CEMSE',
  //     department: 'Cochabamba',
  //     region: 'Valle',
  //     email: 'insti@demo.com',
  //     password: institutionPassword,
  //     phone: '+591 4 4250000',
  //     institutionType: 'NGO',
  //     isActive: true,
  //     createdBy: institution.id,
  //   },
  // });

  // console.log('✅ Institución creada:', institutionData.name);

  // Create sample company
  // const companyPassword = await bcrypt.hash('12345678', 12);
  // const company = await prisma.user.upsert({
  //   where: { email: 'comp@demo.com' },
  //   update: {},
  //   create: {
  //     email: 'comp@demo.com',
  //     password: companyPassword,
  //     role: 'COMPANIES',
  //     isActive: true,
  //     profile: {
  //       create: {
  //         firstName: 'Empresa',
  //         lastName: 'Ejemplo',
  //         profileCompletion: 70,
  //         status: 'ACTIVE',
  //       },
  //     },
  //   },
  //   include: {
  //     profile: true,
  //   },
  // });

  // const companyData = await prisma.company.upsert({
  //   where: {
  //     name_institutionId: {
  //       name: 'Tech Solutions Bolivia',
  //       institutionId: institutionData.id
  //     }
  //   },
  //   update: {},
  //   create: {
  //     name: 'Tech Solutions Bolivia',
  //     description: 'Empresa de tecnología especializada en desarrollo de software',
  //     email: 'comp@demo.com',
  //     phone: '+591 4 4250000',
  //     address: 'Av. Heroínas 1234',
  //     businessSector: 'Tecnología',
  //     companySize: 'MEDIUM',
  //     website: 'https://techsolutions.bo',
  //     institutionId: institutionData.id,
  //     isActive: true,
  //     createdBy: admin.id,
  //     password: companyPassword,
  //   },
  // });

  // console.log('✅ Empresa creada:', companyData.name);

  // Create sample youth user
  // const youthPassword = await bcrypt.hash('12345678', 12);
  // const youth = await prisma.user.upsert({
  //   where: { email: 'joven@demo.com' },
  //   update: {},
  //   create: {
  //     email: 'joven@demo.com',
  //     password: youthPassword,
  //     role: 'YOUTH',
  //     isActive: true,
  //     profile: {
  //       create: {
  //         firstName: 'Juan',
  //         lastName: 'Pérez',
  //         phone: '+591 7 12345678',
  //         address: 'Av. Heroínas 5678',
  //         country: 'Bolivia',
  //         birthDate: new Date('2000-01-15'),
  //         gender: 'Masculino',
  //         documentType: 'CI',
  //         documentNumber: '12345678',
  //         educationLevel: 'UNIVERSITY',
  //         currentInstitution: 'Universidad Mayor de San Simón',
  //         graduationYear: 2023,
  //         isStudying: false,
  //         skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  //         interests: ['Programación', 'Tecnología', 'Emprendimiento'],
  //         workExperience: [
  //           {
  //             company: 'Startup Tech',
  //             position: 'Desarrollador Junior',
  //             duration: '6 meses',
  //             description: 'Desarrollo de aplicaciones web'
  //           }
  //         ],
  //         profileCompletion: 85,
  //         status: 'ACTIVE',
  //         parentalConsent: true,
  //         parentEmail: 'padres@email.com',
  //         consentDate: new Date(),
  //       },
  //     },
  //   },
  //   include: {
  //     profile: true,
  //   },
  // });

  // console.log('✅ Usuario joven creado:', youth.email);

  // Create sample course
  // const course = await prisma.course.upsert({
  //   where: { slug: 'introduccion-programacion' },
  //   update: {},
  //   create: {
  //     title: 'Introducción a la Programación',
  //     slug: 'introduccion-programacion',
  //     description: 'Aprende los fundamentos de la programación desde cero',
  //     shortDescription: 'Curso básico de programación para principiantes',
  //     objectives: [
  //       'Comprender los conceptos básicos de programación',
  //       'Aprender a usar variables y funciones',
  //       'Desarrollar lógica de programación',
  //       'Crear tu primer programa'
  //     ],
  //     prerequisites: ['Conocimientos básicos de matemáticas'],
  //     duration: 40, // hours
  //     level: 'BEGINNER',
  //     category: 'TECHNICAL_SKILLS',
  //     isMandatory: false,
  //     isActive: true,
  //     rating: 4.5,
  //     studentsCount: 0,
  //     completionRate: 0,
  //     totalLessons: 0,
  //     totalQuizzes: 0,
  //     totalResources: 0,
  //     tags: ['programación', 'básico', 'tecnología'],
  //     certification: true,
  //     includedMaterials: ['Videos', 'Ejercicios', 'Certificado'],
  //     instructorId: youth.profile?.userId,
  //     institutionName: institutionData.name,
  //     publishedAt: new Date(),
  //   },
  // });

  // console.log('✅ Curso creado:', course.title);

  // Create sample job offer
  // const jobOffer = await prisma.jobOffer.upsert({
  //   where: { id: 'sample-job-1' },
  //   update: {},
  //   create: {
  //     id: 'sample-job-1',
  //     title: 'Desarrollador Frontend Junior',
  //     description: 'Buscamos un desarrollador frontend junior para unirse a nuestro equipo de desarrollo',
  //     requirements: 'Conocimientos en HTML, CSS, JavaScript y React',
  //     benefits: 'Salario competitivo, horario flexible, trabajo remoto',
  //     salaryMin: 3000,
  //     salaryMax: 5000,
  //     salaryCurrency: 'BOB',
  //     contractType: 'FULL_TIME',
  //     workSchedule: 'Lunes a Viernes, 8:00 - 17:00',
  //     workModality: 'HYBRID',
  //     location: 'Cochabamba, Bolivia',
  //     municipality: 'Cochabamba',
  //     department: 'Cochabamba',
  //     experienceLevel: 'ENTRY_LEVEL',
  //     educationRequired: 'UNIVERSITY',
  //     skillsRequired: ['JavaScript', 'React', 'HTML', 'CSS'],
  //     desiredSkills: ['TypeScript', 'Node.js', 'Git'],
  //     applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  //     isActive: true,
  //     status: 'ACTIVE',
  //     viewsCount: 0,
  //     applicationsCount: 0,
  //     featured: true,
  //     publishedAt: new Date(),
  //     companyId: companyData.id,
  //     latitude: -17.3938,
  //     longitude: -66.1570,
  //     images: [],
  //   },
  // });

  // console.log('✅ Oferta de trabajo creada:', jobOffer.title);

  // Create sample news article
  // const newsArticle = await prisma.newsArticle.upsert({
  //   where: { id: 'sample-news-1' },
  //   update: {},
  //   create: {
  //     id: 'sample-news-1',
  //     title: 'CEMSE lanza nueva plataforma de educación y empleo',
  //     content: 'La nueva plataforma CEMSE ofrece oportunidades de educación, empleo y emprendimiento para jóvenes bolivianos...',
  //     summary: 'CEMSE presenta su plataforma integral para el desarrollo juvenil',
  //     authorId: institution.profile?.userId || '',
  //     authorName: institutionData.name,
  //         authorType: 'INSTITUTION',
  //     status: 'PUBLISHED',
  //     priority: 'HIGH',
  //     featured: true,
  //     tags: ['educación', 'empleo', 'jóvenes', 'tecnología'],
  //     category: 'Educación',
  //     publishedAt: new Date(),
  //     viewCount: 0,
  //     likeCount: 0,
  //     commentCount: 0,
  //     targetAudience: ['YOUTH', 'INSTITUTION'],
  //     region: 'Cochabamba',
  //     isEntrepreneurshipRelated: false,
  //   },
  // });

  // console.log('✅ Artículo de noticias creado:', newsArticle.title);

  console.log('🎉 Seed completado exitosamente!');
}


main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
