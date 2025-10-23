import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Datos de prueba para instituciones
const institutionsData = [
  // Municipalidades
  {
    name: 'Municipalidad de Quillacollo',
    department: 'Cochabamba',
    region: 'Valle',
    population: 137029,
    mayorName: 'Dr. Eduardo Mérida',
    mayorEmail: 'alcalde@quillacollo.gob.bo',
    mayorPhone: '+591 4 4250000',
    address: 'Plaza Principal, Quillacollo',
    website: 'https://quillacollo.gob.bo',
    institutionType: 'MUNICIPALITY' as const,
    email: 'admin@quillacollo.gob.bo',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
  },
  {
    name: 'Municipalidad de Sacaba',
    department: 'Cochabamba',
    region: 'Valle',
    population: 175761,
    mayorName: 'Lic. Pedro Gutiérrez',
    mayorEmail: 'alcalde@sacaba.gob.bo',
    mayorPhone: '+591 4 4251000',
    address: 'Plaza Principal, Sacaba',
    website: 'https://sacaba.gob.bo',
    institutionType: 'MUNICIPALITY' as const,
    email: 'admin@sacaba.gob.bo',
    primaryColor: '#059669',
    secondaryColor: '#10B981',
  },
  {
    name: 'Municipalidad de Tiquipaya',
    department: 'Cochabamba',
    region: 'Valle',
    population: 53000,
    mayorName: 'Ing. María Fernández',
    mayorEmail: 'alcalde@tiquipaya.gob.bo',
    mayorPhone: '+591 4 4252000',
    address: 'Plaza Principal, Tiquipaya',
    website: 'https://tiquipaya.gob.bo',
    institutionType: 'MUNICIPALITY' as const,
    email: 'admin@tiquipaya.gob.bo',
    primaryColor: '#DC2626',
    secondaryColor: '#EF4444',
  },
  {
    name: 'Municipalidad de Cercado',
    department: 'Cochabamba',
    region: 'Valle',
    population: 630000,
    mayorName: 'Dr. Manfred Reyes Villa',
    mayorEmail: 'alcalde@cochabamba.gob.bo',
    mayorPhone: '+591 4 4253000',
    address: 'Plaza Principal, Cochabamba',
    website: 'https://cochabamba.gob.bo',
    institutionType: 'MUNICIPALITY' as const,
    email: 'admin@cochabamba.gob.bo',
    primaryColor: '#7C3AED',
    secondaryColor: '#8B5CF6',
  },
  // ONGs
  {
    name: 'Fundación Emplea y Emprende',
    department: 'Cochabamba',
    region: 'Valle',
    population: null,
    mayorName: 'Lic. Ana Morales',
    mayorEmail: 'directora@empleayemprende.org',
    mayorPhone: '+591 4 4254000',
    address: 'Av. Heroínas 1234, Cochabamba',
    website: 'https://empleayemprende.org',
    institutionType: 'NGO' as const,
    email: 'admin@empleayemprende.org',
    primaryColor: '#EA580C',
    secondaryColor: '#F97316',
  },
  {
    name: 'ChildFund Bolivia',
    department: 'Cochabamba',
    region: 'Valle',
    population: null,
    mayorName: 'Dr. Carlos Mendoza',
    mayorEmail: 'director@childfund.org.bo',
    mayorPhone: '+591 4 4255000',
    address: 'Av. América 5678, Cochabamba',
    website: 'https://childfund.org.bo',
    institutionType: 'NGO' as const,
    email: 'admin@childfund.org.bo',
    primaryColor: '#0891B2',
    secondaryColor: '#06B6D4',
  },
  // Centros de Entrenamiento
  {
    name: 'Centro de Capacitación Kallpa',
    department: 'Cochabamba',
    region: 'Valle',
    population: null,
    mayorName: 'Lic. Patricia Vargas',
    mayorEmail: 'directora@kallpa.org.bo',
    mayorPhone: '+591 4 4256000',
    address: 'Av. Blanco Galindo 9012, Cochabamba',
    website: 'https://kallpa.org.bo',
    institutionType: 'TRAINING_CENTER' as const,
    email: 'admin@kallpa.org.bo',
    primaryColor: '#BE185D',
    secondaryColor: '#EC4899',
  },
  {
    name: 'Instituto Técnico Superior María Auxiliadora',
    department: 'Cochabamba',
    region: 'Valle',
    population: null,
    mayorName: 'Hna. Carmen López',
    mayorEmail: 'directora@mariaauxiliadora.edu.bo',
    mayorPhone: '+591 4 4257000',
    address: 'Av. Potosí 3456, Cochabamba',
    website: 'https://mariaauxiliadora.edu.bo',
    institutionType: 'TRAINING_CENTER' as const,
    email: 'admin@mariaauxiliadora.edu.bo',
    primaryColor: '#B45309',
    secondaryColor: '#D97706',
  },
];

// Datos de empresas
const companiesData = [
  {
    name: 'Tech Solutions Bolivia',
    description: 'Empresa líder en desarrollo de software y soluciones tecnológicas',
    businessSector: 'Tecnología',
    companySize: 'MEDIUM' as const,
    website: 'https://techsolutions.bo',
    email: 'info@techsolutions.bo',
    phone: '+591 4 4258000',
    address: 'Av. Heroínas 1001, Cochabamba',
    foundedYear: 2015,
    municipality: 'Quillacollo',
  },
  {
    name: 'Constructora Andina',
    description: 'Empresa especializada en construcción civil y obras públicas',
    businessSector: 'Construcción',
    companySize: 'LARGE' as const,
    website: 'https://constructoraandina.bo',
    email: 'info@constructoraandina.bo',
    phone: '+591 4 4259000',
    address: 'Av. América 2002, Sacaba',
    foundedYear: 2010,
    municipality: 'Sacaba',
  },
  {
    name: 'Agroindustria Valle Verde',
    description: 'Empresa dedicada a la producción y comercialización de productos agrícolas',
    businessSector: 'Agroindustria',
    companySize: 'MEDIUM' as const,
    website: 'https://valleverde.bo',
    email: 'info@valleverde.bo',
    phone: '+591 4 4260000',
    address: 'Zona Industrial, Tiquipaya',
    foundedYear: 2018,
    municipality: 'Tiquipaya',
  },
  {
    name: 'Servicios Financieros CEMSE',
    description: 'Empresa de servicios financieros y consultoría empresarial',
    businessSector: 'Servicios Financieros',
    companySize: 'SMALL' as const,
    website: 'https://cemse.bo',
    email: 'info@cemse.bo',
    phone: '+591 4 4261000',
    address: 'Av. Blanco Galindo 3003, Cochabamba',
    foundedYear: 2020,
    municipality: 'Cercado',
  },
  {
    name: 'Restaurante Gourmet',
    description: 'Restaurante especializado en comida gourmet y eventos corporativos',
    businessSector: 'Gastronomía',
    companySize: 'SMALL' as const,
    website: 'https://gourmet.bo',
    email: 'info@gourmet.bo',
    phone: '+591 4 4262000',
    address: 'Plaza Principal, Quillacollo',
    foundedYear: 2019,
    municipality: 'Quillacollo',
  },
  {
    name: 'Transporte Rápido',
    description: 'Empresa de transporte de carga y logística',
    businessSector: 'Transporte',
    companySize: 'MEDIUM' as const,
    website: 'https://transportrapido.bo',
    email: 'info@transportrapido.bo',
    phone: '+591 4 4263000',
    address: 'Terminal de Buses, Sacaba',
    foundedYear: 2012,
    municipality: 'Sacaba',
  },
];

// Datos de usuarios jóvenes
const youthUsersData = [
  {
    firstName: 'Juan Carlos',
    lastName: 'Pérez Morales',
    email: 'juan.perez@email.com',
    phone: '+591 7 12345678',
    address: 'Av. Heroínas 1001, Quillacollo',
    birthDate: new Date('2000-01-15'),
    gender: 'Masculino',
    documentType: 'CI',
    documentNumber: '12345678',
    educationLevel: 'UNIVERSITY' as const,
    currentInstitution: 'Universidad Mayor de San Simón',
    graduationYear: 2023,
    isStudying: false,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    interests: ['Programación', 'Tecnología', 'Emprendimiento'],
    workExperience: [
      {
        company: 'Startup Tech',
        position: 'Desarrollador Junior',
        duration: '6 meses',
        description: 'Desarrollo de aplicaciones web'
      }
    ],
    city: 'Quillacollo',
    state: 'Cochabamba',
    professionalSummary: 'Desarrollador web con experiencia en tecnologías modernas',
    experienceLevel: 'ENTRY_LEVEL' as const,
    languages: ['Español', 'Inglés'],
    targetPosition: 'Desarrollador Frontend',
    targetCompany: 'Tech Solutions Bolivia',
    relevantSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
  },
  {
    firstName: 'María Elena',
    lastName: 'González Silva',
    email: 'maria.gonzalez@email.com',
    phone: '+591 7 23456789',
    address: 'Av. América 2002, Sacaba',
    birthDate: new Date('1999-05-20'),
    gender: 'Femenino',
    documentType: 'CI',
    documentNumber: '23456789',
    educationLevel: 'TECHNICAL' as const,
    currentInstitution: 'Instituto Técnico Superior María Auxiliadora',
    graduationYear: 2022,
    isStudying: false,
    skills: ['Contabilidad', 'Excel Avanzado', 'Gestión de Inventarios', 'Atención al Cliente'],
    interests: ['Administración', 'Finanzas', 'Emprendimiento'],
    workExperience: [
      {
        company: 'Contadora Independiente',
        position: 'Asistente Contable',
        duration: '1 año',
        description: 'Manejo de libros contables y declaraciones tributarias'
      }
    ],
    city: 'Sacaba',
    state: 'Cochabamba',
    professionalSummary: 'Profesional en administración con experiencia en contabilidad',
    experienceLevel: 'ENTRY_LEVEL' as const,
    languages: ['Español'],
    targetPosition: 'Asistente Administrativo',
    targetCompany: 'Servicios Financieros CEMSE',
    relevantSkills: ['Contabilidad', 'Excel', 'Administración'],
  },
  {
    firstName: 'Carlos Alberto',
    lastName: 'Mamani Quispe',
    email: 'carlos.mamani@email.com',
    phone: '+591 7 34567890',
    address: 'Zona Industrial, Tiquipaya',
    birthDate: new Date('2001-08-10'),
    gender: 'Masculino',
    documentType: 'CI',
    documentNumber: '34567890',
    educationLevel: 'SECONDARY' as const,
    currentInstitution: 'Colegio Nacional Tiquipaya',
    graduationYear: 2020,
    isStudying: true,
    skills: ['Mecánica Automotriz', 'Soldadura', 'Mantenimiento Industrial'],
    interests: ['Mecánica', 'Tecnología', 'Innovación'],
    workExperience: [
      {
        company: 'Taller Mecánico Familiar',
        position: 'Aprendiz de Mecánico',
        duration: '2 años',
        description: 'Reparación y mantenimiento de vehículos'
      }
    ],
    city: 'Tiquipaya',
    state: 'Cochabamba',
    professionalSummary: 'Técnico en mecánica automotriz con experiencia práctica',
    experienceLevel: 'NO_EXPERIENCE' as const,
    languages: ['Español', 'Quechua'],
    targetPosition: 'Técnico Mecánico',
    targetCompany: 'Transporte Rápido',
    relevantSkills: ['Mecánica', 'Soldadura', 'Mantenimiento'],
  },
  {
    firstName: 'Ana Lucía',
    lastName: 'Vargas Rodríguez',
    email: 'ana.vargas@email.com',
    phone: '+591 7 45678901',
    address: 'Av. Blanco Galindo 3003, Cochabamba',
    birthDate: new Date('2002-03-25'),
    gender: 'Femenino',
    documentType: 'CI',
    documentNumber: '45678901',
    educationLevel: 'UNIVERSITY' as const,
    currentInstitution: 'Universidad Católica Boliviana',
    graduationYear: 2024,
    isStudying: true,
    skills: ['Marketing Digital', 'Redes Sociales', 'Diseño Gráfico', 'Fotografía'],
    interests: ['Marketing', 'Diseño', 'Comunicación', 'Emprendimiento'],
    workExperience: [
      {
        company: 'Agencia Digital Local',
        position: 'Practicante de Marketing',
        duration: '3 meses',
        description: 'Gestión de redes sociales y creación de contenido'
      }
    ],
    city: 'Cochabamba',
    state: 'Cochabamba',
    professionalSummary: 'Estudiante de marketing con habilidades en diseño y comunicación',
    experienceLevel: 'NO_EXPERIENCE' as const,
    languages: ['Español', 'Inglés'],
    targetPosition: 'Especialista en Marketing Digital',
    targetCompany: 'Restaurante Gourmet',
    relevantSkills: ['Marketing Digital', 'Redes Sociales', 'Diseño'],
  },
  {
    firstName: 'Roberto',
    lastName: 'Fernández Castro',
    email: 'roberto.fernandez@email.com',
    phone: '+591 7 56789012',
    address: 'Plaza Principal, Quillacollo',
    birthDate: new Date('1998-11-12'),
    gender: 'Masculino',
    documentType: 'CI',
    documentNumber: '56789012',
    educationLevel: 'TECHNICAL' as const,
    currentInstitution: 'Centro de Capacitación Kallpa',
    graduationYear: 2021,
    isStudying: false,
    skills: ['Construcción Civil', 'Dibujo Técnico', 'Seguridad Industrial', 'Supervisión de Obras'],
    interests: ['Construcción', 'Arquitectura', 'Emprendimiento'],
    workExperience: [
      {
        company: 'Constructora Andina',
        position: 'Obrero Especializado',
        duration: '1 año',
        description: 'Trabajo en construcción de edificios residenciales'
      }
    ],
    city: 'Quillacollo',
    state: 'Cochabamba',
    professionalSummary: 'Técnico en construcción con experiencia en obras civiles',
    experienceLevel: 'ENTRY_LEVEL' as const,
    languages: ['Español'],
    targetPosition: 'Supervisor de Obras',
    targetCompany: 'Constructora Andina',
    relevantSkills: ['Construcción', 'Supervisión', 'Seguridad Industrial'],
  },
];

// Datos de cursos
const coursesData = [
  {
    title: 'Desarrollo Web Frontend con React',
    slug: 'desarrollo-web-frontend-react',
    description: 'Aprende a desarrollar aplicaciones web modernas usando React, JavaScript ES6+ y herramientas de desarrollo actuales.',
    shortDescription: 'Curso completo de desarrollo frontend con React',
    objectives: [
      'Dominar los fundamentos de React y JSX',
      'Implementar componentes reutilizables',
      'Manejar el estado con hooks',
      'Integrar APIs y servicios externos',
      'Desplegar aplicaciones web'
    ],
    prerequisites: ['Conocimientos básicos de HTML, CSS y JavaScript'],
    duration: 60,
    level: 'INTERMEDIATE' as const,
    category: 'TECHNICAL_SKILLS' as const,
    tags: ['react', 'javascript', 'frontend', 'web development'],
    includedMaterials: ['Videos', 'Ejercicios prácticos', 'Proyectos', 'Certificado'],
  },
  {
    title: 'Contabilidad Básica para Emprendedores',
    slug: 'contabilidad-basica-emprendedores',
    description: 'Fundamentos de contabilidad aplicados al emprendimiento y gestión de pequeñas empresas.',
    shortDescription: 'Aprende contabilidad básica para tu negocio',
    objectives: [
      'Comprender los principios contables básicos',
      'Manejar libros contables',
      'Elaborar estados financieros',
      'Calcular impuestos básicos',
      'Implementar sistemas de control interno'
    ],
    prerequisites: ['Conocimientos básicos de matemáticas'],
    duration: 40,
    level: 'BEGINNER' as const,
    category: 'ENTREPRENEURSHIP' as const,
    tags: ['contabilidad', 'emprendimiento', 'finanzas', 'negocios'],
    includedMaterials: ['Plantillas', 'Ejercicios', 'Casos prácticos', 'Certificado'],
  },
  {
    title: 'Marketing Digital y Redes Sociales',
    slug: 'marketing-digital-redes-sociales',
    description: 'Estrategias efectivas de marketing digital y gestión de redes sociales para empresas y emprendimientos.',
    shortDescription: 'Domina el marketing digital y las redes sociales',
    objectives: [
      'Crear estrategias de marketing digital',
      'Gestionar redes sociales efectivamente',
      'Crear contenido atractivo',
      'Medir resultados y ROI',
      'Implementar campañas publicitarias'
    ],
    prerequisites: ['Conocimientos básicos de internet'],
    duration: 50,
    level: 'INTERMEDIATE' as const,
    category: 'ENTREPRENEURSHIP' as const,
    tags: ['marketing', 'redes sociales', 'digital', 'publicidad'],
    includedMaterials: ['Herramientas', 'Plantillas', 'Casos de estudio', 'Certificado'],
  },
  {
    title: 'Mecánica Automotriz Básica',
    slug: 'mecanica-automotriz-basica',
    description: 'Fundamentos de mecánica automotriz, mantenimiento preventivo y reparaciones básicas.',
    shortDescription: 'Aprende mecánica automotriz desde cero',
    objectives: [
      'Identificar componentes del motor',
      'Realizar mantenimiento preventivo',
      'Diagnosticar problemas básicos',
      'Realizar reparaciones simples',
      'Aplicar medidas de seguridad'
    ],
    prerequisites: ['Interés en mecánica automotriz'],
    duration: 80,
    level: 'BEGINNER' as const,
    category: 'TECHNICAL_SKILLS' as const,
    tags: ['mecánica', 'automotriz', 'mantenimiento', 'reparación'],
    includedMaterials: ['Herramientas', 'Manuales', 'Prácticas', 'Certificado'],
  },
  {
    title: 'Construcción Civil y Seguridad',
    slug: 'construccion-civil-seguridad',
    description: 'Técnicas de construcción civil, normativas de seguridad y supervisión de obras.',
    shortDescription: 'Especialízate en construcción civil y seguridad',
    objectives: [
      'Aplicar técnicas de construcción',
      'Implementar medidas de seguridad',
      'Supervisar obras de construcción',
      'Cumplir normativas vigentes',
      'Gestionar recursos y materiales'
    ],
    prerequisites: ['Conocimientos básicos de matemáticas'],
    duration: 70,
    level: 'INTERMEDIATE' as const,
    category: 'TECHNICAL_SKILLS' as const,
    tags: ['construcción', 'seguridad', 'supervisión', 'normativas'],
    includedMaterials: ['Normativas', 'Herramientas', 'Prácticas', 'Certificado'],
  },
];

// Datos de ofertas de trabajo
const jobOffersData = [
  {
    title: 'Desarrollador Frontend Junior',
    description: 'Buscamos un desarrollador frontend junior para unirse a nuestro equipo de desarrollo. Trabajarás en proyectos web modernos usando React y tecnologías actuales.',
    requirements: 'Conocimientos sólidos en HTML, CSS, JavaScript y React. Experiencia con Git y herramientas de desarrollo.',
    responsibilities: [
      'Desarrollar interfaces de usuario responsivas',
      'Implementar componentes React reutilizables',
      'Colaborar con el equipo de diseño',
      'Optimizar rendimiento de aplicaciones web',
      'Participar en code reviews'
    ],
    benefits: 'Salario competitivo, horario flexible, trabajo remoto parcial, capacitación continua, ambiente de trabajo colaborativo',
    salaryMin: 3500,
    salaryMax: 5500,
    contractType: 'FULL_TIME' as const,
    workSchedule: 'Lunes a Viernes, 8:00 - 17:00',
    workModality: 'HYBRID' as const,
    location: 'Quillacollo, Cochabamba',
    municipality: 'Quillacollo',
    experienceLevel: 'ENTRY_LEVEL' as const,
    educationRequired: 'UNIVERSITY' as const,
    skillsRequired: ['JavaScript', 'React', 'HTML', 'CSS', 'Git'],
    desiredSkills: ['TypeScript', 'Node.js', 'Testing', 'Figma'],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    featured: true,
  },
  {
    title: 'Asistente Administrativo',
    description: 'Empresa de servicios financieros busca asistente administrativo para apoyar en tareas contables y administrativas.',
    requirements: 'Técnico en administración o contabilidad. Conocimientos en Excel avanzado y sistemas contables.',
    responsibilities: [
      'Manejar libros contables',
      'Procesar facturas y pagos',
      'Elaborar reportes financieros',
      'Atención al cliente',
      'Apoyo en tareas administrativas'
    ],
    benefits: 'Salario base, seguro de salud, capacitación, oportunidades de crecimiento',
    salaryMin: 2500,
    salaryMax: 3500,
    contractType: 'FULL_TIME' as const,
    workSchedule: 'Lunes a Viernes, 8:00 - 16:00',
    workModality: 'ON_SITE' as const,
    location: 'Cochabamba, Bolivia',
    municipality: 'Cercado',
    experienceLevel: 'ENTRY_LEVEL' as const,
    educationRequired: 'TECHNICAL' as const,
    skillsRequired: ['Contabilidad', 'Excel', 'Atención al Cliente', 'Organización'],
    desiredSkills: ['Sistemas Contables', 'Power BI', 'Inglés'],
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    featured: false,
  },
  {
    title: 'Técnico Mecánico Automotriz',
    description: 'Empresa de transporte busca técnico mecánico para mantenimiento y reparación de vehículos de carga.',
    requirements: 'Técnico en mecánica automotriz o experiencia comprobable. Conocimientos en motores diésel.',
    responsibilities: [
      'Mantenimiento preventivo de vehículos',
      'Diagnóstico y reparación de fallas',
      'Mantenimiento de motores diésel',
      'Control de inventario de repuestos',
      'Cumplir protocolos de seguridad'
    ],
    benefits: 'Salario competitivo, seguro de salud, herramientas de trabajo, capacitación técnica',
    salaryMin: 3000,
    salaryMax: 4500,
    contractType: 'FULL_TIME' as const,
    workSchedule: 'Lunes a Sábado, 7:00 - 16:00',
    workModality: 'ON_SITE' as const,
    location: 'Sacaba, Cochabamba',
    municipality: 'Sacaba',
    experienceLevel: 'ENTRY_LEVEL' as const,
    educationRequired: 'TECHNICAL' as const,
    skillsRequired: ['Mecánica Automotriz', 'Motores Diésel', 'Herramientas', 'Seguridad'],
    desiredSkills: ['Diagnóstico Electrónico', 'Soldadura', 'Inglés Técnico'],
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    featured: true,
  },
  {
    title: 'Especialista en Marketing Digital',
    description: 'Restaurante gourmet busca especialista en marketing digital para gestionar presencia online y redes sociales.',
    requirements: 'Conocimientos en marketing digital, redes sociales y creación de contenido. Experiencia con herramientas de diseño.',
    responsibilities: [
      'Gestionar redes sociales del restaurante',
      'Crear contenido visual atractivo',
      'Desarrollar campañas publicitarias',
      'Analizar métricas y resultados',
      'Coordinar eventos y promociones'
    ],
    benefits: 'Salario base, comisiones por resultados, horario flexible, ambiente creativo',
    salaryMin: 2800,
    salaryMax: 4000,
    contractType: 'PART_TIME' as const,
    workSchedule: 'Lunes a Viernes, 9:00 - 15:00',
    workModality: 'HYBRID' as const,
    location: 'Quillacollo, Cochabamba',
    municipality: 'Quillacollo',
    experienceLevel: 'ENTRY_LEVEL' as const,
    educationRequired: 'UNIVERSITY' as const,
    skillsRequired: ['Marketing Digital', 'Redes Sociales', 'Diseño Gráfico', 'Creatividad'],
    desiredSkills: ['Fotografía', 'Video Marketing', 'Analytics', 'Inglés'],
    applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    featured: false,
  },
  {
    title: 'Supervisor de Obras',
    description: 'Constructora busca supervisor de obras para dirigir proyectos de construcción residencial y comercial.',
    requirements: 'Técnico en construcción civil. Experiencia en supervisión de obras y conocimiento de normativas.',
    responsibilities: [
      'Supervisar obras de construcción',
      'Coordinar equipos de trabajo',
      'Controlar calidad y cumplimiento',
      'Gestionar recursos y materiales',
      'Cumplir normativas de seguridad'
    ],
    benefits: 'Salario competitivo, seguro de salud, herramientas, capacitación continua',
    salaryMin: 4000,
    salaryMax: 6000,
    contractType: 'FULL_TIME' as const,
    workSchedule: 'Lunes a Sábado, 7:00 - 17:00',
    workModality: 'ON_SITE' as const,
    location: 'Sacaba, Cochabamba',
    municipality: 'Sacaba',
    experienceLevel: 'MID_LEVEL' as const,
    educationRequired: 'TECHNICAL' as const,
    skillsRequired: ['Construcción Civil', 'Supervisión', 'Seguridad Industrial', 'Liderazgo'],
    desiredSkills: ['AutoCAD', 'Gestión de Proyectos', 'Normativas', 'Inglés'],
    applicationDeadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    featured: true,
  },
];

// Datos de noticias
const newsData = [
  {
    title: 'Emplea y Emprende lanza nueva plataforma de educación y empleo',
    content: 'La nueva plataforma Emplea y Emprende ofrece oportunidades de educación, empleo y emprendimiento para jóvenes bolivianos. Con más de 50 cursos disponibles y conexión directa con empresas locales, esta iniciativa busca reducir el desempleo juvenil en Cochabamba.',
    summary: 'Emplea y Emprende presenta su plataforma integral para el desarrollo juvenil',
    authorType: 'INSTITUTION' as const,
    status: 'PUBLISHED' as const,
    priority: 'HIGH' as const,
    featured: true,
    tags: ['educación', 'empleo', 'jóvenes', 'tecnología'],
    category: 'Educación',
    targetAudience: ['YOUTH', 'INSTITUTION'],
    region: 'Cochabamba',
    isEntrepreneurshipRelated: false,
  },
  {
    title: 'Municipalidad de Quillacollo impulsa programa de emprendimiento juvenil',
    content: 'La Municipalidad de Quillacollo ha lanzado un programa integral de apoyo al emprendimiento juvenil que incluye capacitación técnica, financiamiento inicial y acompañamiento empresarial. El programa está dirigido a jóvenes entre 18 y 30 años.',
    summary: 'Nuevo programa municipal para fomentar el emprendimiento juvenil',
    authorType: 'INSTITUTION' as const,
    status: 'PUBLISHED' as const,
    priority: 'MEDIUM' as const,
    featured: false,
    tags: ['emprendimiento', 'municipalidad', 'jóvenes', 'financiamiento'],
    category: 'Emprendimiento',
    targetAudience: ['YOUTH'],
    region: 'Quillacollo',
    isEntrepreneurshipRelated: true,
  },
  {
    title: 'Tech Solutions Bolivia busca 20 desarrolladores para expansión',
    content: 'La empresa Tech Solutions Bolivia anunció la apertura de 20 nuevas posiciones para desarrolladores de software como parte de su plan de expansión regional. Las posiciones incluyen desarrolladores frontend, backend y full-stack.',
    summary: 'Empresa tecnológica local expande su equipo de desarrollo',
    authorType: 'COMPANY' as const,
    status: 'PUBLISHED' as const,
    priority: 'HIGH' as const,
    featured: true,
    tags: ['tecnología', 'empleo', 'desarrollo', 'expansión'],
    category: 'Empleo',
    targetAudience: ['YOUTH'],
    region: 'Quillacollo',
    isEntrepreneurshipRelated: false,
  },
  {
    title: 'Centro Kallpa capacita a 500 jóvenes en habilidades técnicas',
    content: 'El Centro de Capacitación Kallpa ha completado exitosamente la capacitación de 500 jóvenes en diversas habilidades técnicas incluyendo mecánica automotriz, construcción civil y tecnología. El 80% de los graduados ya cuenta con empleo.',
    summary: 'Centro de capacitación logra alta tasa de empleabilidad en graduados',
    authorType: 'INSTITUTION' as const,
    status: 'PUBLISHED' as const,
    priority: 'MEDIUM' as const,
    featured: false,
    tags: ['capacitación', 'empleabilidad', 'habilidades técnicas', 'jóvenes'],
    category: 'Educación',
    targetAudience: ['YOUTH', 'INSTITUTION'],
    region: 'Cochabamba',
    isEntrepreneurshipRelated: false,
  },
];

// Datos de emprendimientos
const entrepreneurshipData = [
  {
    name: 'TechStart Solutions',
    description: 'Empresa de desarrollo de software especializada en aplicaciones web y móviles para pequeñas y medianas empresas.',
    category: 'Tecnología',
    subcategory: 'Desarrollo de Software',
    businessStage: 'STARTUP' as const,
    website: 'https://techstart.bo',
    email: 'contacto@techstart.bo',
    phone: '+591 7 12345678',
    address: 'Av. Heroínas 1001, Quillacollo',
    municipality: 'Quillacollo',
    socialMedia: {
      facebook: 'https://facebook.com/techstart',
      instagram: 'https://instagram.com/techstart',
      linkedin: 'https://linkedin.com/company/techstart'
    },
    founded: new Date('2023-06-15'),
    employees: 3,
    annualRevenue: 50000,
    businessModel: 'Servicios de desarrollo de software personalizado',
    targetMarket: 'PYMES que necesitan digitalizar sus procesos',
  },
  {
    name: 'ContaFácil Servicios',
    description: 'Servicios contables y administrativos especializados para emprendedores y pequeñas empresas.',
    category: 'Servicios Profesionales',
    subcategory: 'Contabilidad',
    businessStage: 'GROWING' as const,
    website: 'https://contafacil.bo',
    email: 'info@contafacil.bo',
    phone: '+591 7 23456789',
    address: 'Av. América 2002, Sacaba',
    municipality: 'Sacaba',
    socialMedia: {
      facebook: 'https://facebook.com/contafacil',
      whatsapp: 'https://wa.me/591723456789'
    },
    founded: new Date('2022-03-10'),
    employees: 2,
    annualRevenue: 35000,
    businessModel: 'Servicios contables mensuales y consultoría',
    targetMarket: 'Emprendedores y pequeñas empresas',
  },
  {
    name: 'AutoRepair Express',
    description: 'Taller mecánico especializado en mantenimiento preventivo y reparación de vehículos livianos.',
    category: 'Servicios Automotrices',
    subcategory: 'Mecánica Automotriz',
    businessStage: 'IDEA' as const,
    website: null,
    email: 'autorepair@email.com',
    phone: '+591 7 34567890',
    address: 'Zona Industrial, Tiquipaya',
    municipality: 'Tiquipaya',
    socialMedia: {
      facebook: 'https://facebook.com/autorepair',
      instagram: 'https://instagram.com/autorepair'
    },
    founded: null,
    employees: 1,
    annualRevenue: null,
    businessModel: 'Servicios de reparación y mantenimiento automotriz',
    targetMarket: 'Propietarios de vehículos en Tiquipaya y alrededores',
  },
  {
    name: 'Digital Marketing Pro',
    description: 'Agencia de marketing digital especializada en redes sociales y estrategias de contenido para empresas locales.',
    category: 'Marketing y Publicidad',
    subcategory: 'Marketing Digital',
    businessStage: 'STARTUP' as const,
    website: 'https://digitalmarketingpro.bo',
    email: 'hola@digitalmarketingpro.bo',
    phone: '+591 7 45678901',
    address: 'Av. Blanco Galindo 3003, Cochabamba',
    municipality: 'Cochabamba',
    socialMedia: {
      facebook: 'https://facebook.com/digitalmarketingpro',
      instagram: 'https://instagram.com/digitalmarketingpro',
      linkedin: 'https://linkedin.com/company/digitalmarketingpro'
    },
    founded: new Date('2024-01-20'),
    employees: 2,
    annualRevenue: 25000,
    businessModel: 'Gestión de redes sociales y campañas publicitarias',
    targetMarket: 'Restaurantes, tiendas y empresas de servicios locales',
  },
  {
    name: 'Construcciones Rápidas',
    description: 'Empresa de construcción especializada en obras menores, remodelaciones y construcción de viviendas económicas.',
    category: 'Construcción',
    subcategory: 'Construcción Residencial',
    businessStage: 'GROWING' as const,
    website: 'https://construccionesrapidas.bo',
    email: 'info@construccionesrapidas.bo',
    phone: '+591 7 56789012',
    address: 'Plaza Principal, Quillacollo',
    municipality: 'Quillacollo',
    socialMedia: {
      facebook: 'https://facebook.com/construccionesrapidas',
      whatsapp: 'https://wa.me/591756789012'
    },
    founded: new Date('2021-08-15'),
    employees: 5,
    annualRevenue: 80000,
    businessModel: 'Construcción de viviendas y remodelaciones',
    targetMarket: 'Familias de clase media en Quillacollo y alrededores',
  },
];

// Datos de recursos
const resourcesData = [
  {
    title: 'Guía Completa de Emprendimiento Juvenil',
    description: 'Manual completo con herramientas, metodologías y casos de éxito para jóvenes emprendedores',
    type: 'GUIDE',
    category: 'Emprendimiento',
    format: 'PDF',
    author: 'Fundación Emplea y Emprende',
    publishedDate: new Date('2024-01-15'),
    tags: ['emprendimiento', 'jóvenes', 'guía', 'metodología'],
    isEntrepreneurshipRelated: true,
  },
  {
    title: 'Plantillas de Plan de Negocio',
    description: 'Colección de plantillas profesionales para elaborar planes de negocio efectivos',
    type: 'TEMPLATE',
    category: 'Emprendimiento',
    format: 'DOCX',
    author: 'Centro Kallpa',
    publishedDate: new Date('2024-02-01'),
    tags: ['plan de negocio', 'plantillas', 'emprendimiento', 'herramientas'],
    isEntrepreneurshipRelated: true,
  },
  {
    title: 'Curso de Marketing Digital Gratuito',
    description: 'Curso completo de marketing digital con certificación incluida',
    type: 'COURSE',
    category: 'Marketing',
    format: 'VIDEO',
    author: 'Instituto María Auxiliadora',
    publishedDate: new Date('2024-01-20'),
    tags: ['marketing digital', 'curso', 'gratuito', 'certificación'],
    isEntrepreneurshipRelated: false,
  },
  {
    title: 'Manual de Seguridad Industrial',
    description: 'Guía completa de normas y procedimientos de seguridad en obras de construcción',
    type: 'GUIDE',
    category: 'Construcción',
    format: 'PDF',
    author: 'Constructora Andina',
    publishedDate: new Date('2024-02-10'),
    tags: ['seguridad industrial', 'construcción', 'normativas', 'manual'],
    isEntrepreneurshipRelated: false,
  },
];

async function main() {
  console.log('🌱 Iniciando seed completo de la base de datos...');

  // Crear usuario administrador
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

  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear instituciones
  const institutions = [];
  for (const instData of institutionsData) {
    const institutionPassword = await bcrypt.hash('12345678', 12);
    
    const institutionUser = await prisma.user.upsert({
      where: { email: instData.email },
      update: {},
      create: {
        email: instData.email,
        password: institutionPassword,
        role: 'INSTITUTION',
        isActive: true,
        profile: {
          create: {
            firstName: instData.mayorName.split(' ')[0],
            lastName: instData.mayorName.split(' ').slice(1).join(' '),
            profileCompletion: 90,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const institution = await prisma.institution.upsert({
      where: {
        name_department: {
          name: instData.name,
          department: instData.department,
        },
      },
      update: {},
      create: {
        name: instData.name,
        department: instData.department,
        region: instData.region,
        population: instData.population,
        mayorName: instData.mayorName,
        mayorEmail: instData.mayorEmail,
        mayorPhone: instData.mayorPhone,
        address: instData.address,
        website: instData.website,
        institutionType: instData.institutionType,
        email: instData.email,
        password: institutionPassword,
        isActive: true,
        createdBy: institutionUser.id,
        primaryColor: instData.primaryColor,
        secondaryColor: instData.secondaryColor,
      },
    });

    institutions.push(institution);
    console.log(`✅ Institución creada: ${institution.name}`);
  }

  // Crear empresas
  const companies = [];
  for (let i = 0; i < companiesData.length; i++) {
    const compData = companiesData[i];
    const institution = institutions[i % institutions.length]; // Distribuir empresas entre instituciones
    
    const companyPassword = await bcrypt.hash('12345678', 12);
    
    const companyUser = await prisma.user.upsert({
      where: { email: compData.email },
      update: {},
      create: {
        email: compData.email,
        password: companyPassword,
        role: 'COMPANIES',
        isActive: true,
        profile: {
          create: {
            firstName: 'Empresa',
            lastName: compData.name,
            profileCompletion: 80,
            status: 'ACTIVE',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    const company = await prisma.company.upsert({
      where: {
        name_institutionId: {
          name: compData.name,
          institutionId: institution.id,
        },
      },
      update: {},
      create: {
        name: compData.name,
        description: compData.description,
        businessSector: compData.businessSector,
        companySize: compData.companySize,
        website: compData.website,
        email: compData.email,
        phone: compData.phone,
        address: compData.address,
        foundedYear: compData.foundedYear,
        institutionId: institution.id,
        isActive: true,
        createdBy: admin.id,
        password: companyPassword,
      },
    });

    companies.push(company);
    console.log(`✅ Empresa creada: ${company.name}`);
  }

  // Crear usuarios jóvenes
  const youthUsers = [];
  for (const youthData of youthUsersData) {
    const youthPassword = await bcrypt.hash('12345678', 12);
    
    const youth = await prisma.user.upsert({
      where: { email: youthData.email },
      update: {},
      create: {
        email: youthData.email,
        password: youthPassword,
        role: 'YOUTH',
        isActive: true,
        profile: {
          create: {
            firstName: youthData.firstName,
            lastName: youthData.lastName,
            phone: youthData.phone,
            address: youthData.address,
            country: 'Bolivia',
            birthDate: youthData.birthDate,
            gender: youthData.gender,
            documentType: youthData.documentType,
            documentNumber: youthData.documentNumber,
            educationLevel: youthData.educationLevel,
            currentInstitution: youthData.currentInstitution,
            graduationYear: youthData.graduationYear,
            isStudying: youthData.isStudying,
            skills: youthData.skills,
            interests: youthData.interests,
            workExperience: youthData.workExperience,
            profileCompletion: 85,
            status: 'ACTIVE',
            parentalConsent: true,
            parentEmail: 'padres@email.com',
            consentDate: new Date(),
            city: youthData.city,
            state: youthData.state,
            professionalSummary: youthData.professionalSummary,
            experienceLevel: youthData.experienceLevel,
            languages: youthData.languages,
            targetPosition: youthData.targetPosition,
            targetCompany: youthData.targetCompany,
            relevantSkills: youthData.relevantSkills,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    youthUsers.push(youth);
    console.log(`✅ Usuario joven creado: ${youth.email}`);
  }

  // Crear cursos
  const courses = [];
  for (let i = 0; i < coursesData.length; i++) {
    const courseData = coursesData[i];
    const institution = institutions[i % institutions.length];
    const instructor = youthUsers[i % youthUsers.length];
    
    const course = await prisma.course.upsert({
      where: { slug: courseData.slug },
      update: {},
      create: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        shortDescription: courseData.shortDescription,
        objectives: courseData.objectives,
        prerequisites: courseData.prerequisites,
        duration: courseData.duration,
        level: courseData.level,
        category: courseData.category,
        isMandatory: false,
        isActive: true,
        rating: 4.5,
        studentsCount: Math.floor(Math.random() * 100),
        completionRate: 85,
        totalLessons: 0,
        totalQuizzes: 0,
        totalResources: 0,
        tags: courseData.tags,
        certification: true,
        includedMaterials: courseData.includedMaterials,
        instructorId: instructor.profile?.userId,
        institutionId: institution.id,
        institutionName: institution.name,
        publishedAt: new Date(),
      },
    });

    courses.push(course);
    console.log(`✅ Curso creado: ${course.title}`);

    // Crear módulos para cada curso
    const modulesData = [
      {
        title: 'Fundamentos',
        description: 'Conceptos básicos y fundamentales',
        orderIndex: 1,
        estimatedDuration: Math.floor(courseData.duration * 0.3),
      },
      {
        title: 'Desarrollo Práctico',
        description: 'Aplicación práctica de los conocimientos',
        orderIndex: 2,
        estimatedDuration: Math.floor(courseData.duration * 0.5),
      },
      {
        title: 'Proyecto Final',
        description: 'Proyecto integrador final',
        orderIndex: 3,
        estimatedDuration: Math.floor(courseData.duration * 0.2),
      },
    ];

    for (const moduleData of modulesData) {
      const module = await prisma.courseModule.create({
        data: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description,
          orderIndex: moduleData.orderIndex,
          estimatedDuration: moduleData.estimatedDuration,
          isLocked: moduleData.orderIndex > 1,
          prerequisites: [],
          hasCertificate: true,
        },
      });

      // Crear lecciones para cada módulo
      const lessonsData = [
        {
          title: `Lección 1: ${moduleData.title}`,
          description: 'Introducción a los conceptos principales',
          content: 'Contenido detallado de la lección...',
          contentType: 'VIDEO' as const,
          orderIndex: 1,
          duration: Math.floor(moduleData.estimatedDuration * 0.3),
        },
        {
          title: `Lección 2: ${moduleData.title}`,
          description: 'Desarrollo de habilidades prácticas',
          content: 'Contenido práctico de la lección...',
          contentType: 'TEXT' as const,
          orderIndex: 2,
          duration: Math.floor(moduleData.estimatedDuration * 0.4),
        },
        {
          title: `Lección 3: ${moduleData.title}`,
          description: 'Evaluación y práctica',
          content: 'Ejercicios y evaluación...',
          contentType: 'QUIZ' as const,
          orderIndex: 3,
          duration: Math.floor(moduleData.estimatedDuration * 0.3),
        },
      ];

      for (const lessonData of lessonsData) {
        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: lessonData.title,
            description: lessonData.description,
            content: lessonData.content,
            contentType: lessonData.contentType,
            orderIndex: lessonData.orderIndex,
            duration: lessonData.duration,
            isRequired: true,
            isPreview: lessonData.orderIndex === 1,
          },
        });
      }

      // Crear cuestionario para el módulo
      await prisma.quiz.create({
        data: {
          courseId: course.id,
          title: `Cuestionario: ${moduleData.title}`,
          description: `Evaluación del módulo ${moduleData.title}`,
          questions: [
            {
              question: '¿Cuál es el concepto principal de este módulo?',
              type: 'multiple_choice',
              options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
              correctAnswer: 0,
            },
            {
              question: 'Explique brevemente el tema principal.',
              type: 'text',
              correctAnswer: null,
            },
          ],
          passingScore: 70,
          timeLimit: 30,
          attempts: 3,
          isActive: true,
        },
      });
    }
  }

  // Crear ofertas de trabajo
  const jobOffers = [];
  for (let i = 0; i < jobOffersData.length; i++) {
    const jobData = jobOffersData[i];
    const company = companies[i % companies.length];
    
    const jobOffer = await prisma.jobOffer.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        benefits: jobData.benefits,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryCurrency: 'BOB',
        contractType: jobData.contractType,
        workSchedule: jobData.workSchedule,
        workModality: jobData.workModality,
        location: jobData.location,
        municipality: jobData.municipality,
        department: 'Cochabamba',
        experienceLevel: jobData.experienceLevel,
        educationRequired: jobData.educationRequired,
        skillsRequired: jobData.skillsRequired,
        desiredSkills: jobData.desiredSkills,
        skills: [...jobData.skillsRequired, ...jobData.desiredSkills],
        tags: jobData.skillsRequired,
        applicationDeadline: jobData.applicationDeadline,
        isActive: true,
        status: 'ACTIVE',
        viewsCount: Math.floor(Math.random() * 100),
        applicationsCount: 0,
        featured: jobData.featured,
        publishedAt: new Date(),
        companyId: company.id,
        latitude: -17.3938 + (Math.random() - 0.5) * 0.1,
        longitude: -66.1570 + (Math.random() - 0.5) * 0.1,
        images: [],
      },
    });

    jobOffers.push(jobOffer);
    console.log(`✅ Oferta de trabajo creada: ${jobOffer.title}`);

    // Crear preguntas para la oferta de trabajo
    const questions = [
      {
        question: '¿Por qué te interesa trabajar en nuestra empresa?',
        type: 'text',
        isRequired: true,
        orderIndex: 1,
      },
      {
        question: '¿Cuál es tu nivel de experiencia en las tecnologías requeridas?',
        type: 'multiple_choice',
        options: ['Principiante', 'Intermedio', 'Avanzado', 'Experto'],
        isRequired: true,
        orderIndex: 2,
      },
      {
        question: '¿Cuál es tu disponibilidad horaria?',
        type: 'text',
        isRequired: true,
        orderIndex: 3,
      },
    ];

    for (const questionData of questions) {
      await prisma.jobQuestion.create({
        data: {
          jobOfferId: jobOffer.id,
          question: questionData.question,
          type: questionData.type,
          options: questionData.options || null,
          isRequired: questionData.isRequired,
          orderIndex: questionData.orderIndex,
        },
      });
    }
  }

  // Crear aplicaciones de trabajo
  for (let i = 0; i < youthUsers.length; i++) {
    const youth = youthUsers[i];
    const jobOffer = jobOffers[i % jobOffers.length];
    
    const application = await prisma.jobApplication.create({
      data: {
        applicantId: youth.profile!.userId,
        jobOfferId: jobOffer.id,
        coverLetter: `Estimados señores,\n\nMe dirijo a ustedes para expresar mi interés en la posición de ${jobOffer.title}. Mi experiencia y habilidades se alinean perfectamente con los requisitos del puesto.\n\nEspero tener la oportunidad de contribuir al éxito de su empresa.\n\nAtentamente,\n${youth.profile!.firstName} ${youth.profile!.lastName}`,
        status: ['SENT', 'UNDER_REVIEW', 'PRE_SELECTED'][Math.floor(Math.random() * 3)] as any,
        appliedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        notes: 'Candidato prometedor con buen perfil',
        rating: Math.floor(Math.random() * 5) + 1,
      },
    });

    // Crear respuestas a las preguntas
    const questions = await prisma.jobQuestion.findMany({
      where: { jobOfferId: jobOffer.id },
    });

    for (const question of questions) {
      await prisma.jobQuestionAnswer.create({
        data: {
          applicationId: application.id,
          questionId: question.id,
          answer: question.type === 'text' 
            ? 'Esta es mi respuesta detallada a la pregunta.'
            : question.options?.[Math.floor(Math.random() * question.options.length)] || 'Opción seleccionada',
        },
      });
    }

    console.log(`✅ Aplicación de trabajo creada para ${youth.profile!.firstName}`);
  }

  // Crear aplicaciones de jóvenes
  for (const youth of youthUsers) {
    const youthApplication = await prisma.youthApplication.create({
      data: {
        title: `Perfil Profesional - ${youth.profile!.firstName} ${youth.profile!.lastName}`,
        description: `Joven profesional con experiencia en ${youth.profile!.skills?.join(', ')}. Busco oportunidades de crecimiento profesional en empresas que valoren la innovación y el desarrollo personal.`,
        status: 'ACTIVE',
        isPublic: true,
        viewsCount: Math.floor(Math.random() * 50),
        applicationsCount: 0,
        youthProfileId: youth.profile!.userId,
      },
    });

    // Crear intereses de empresas
    const randomCompanies = companies.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);
    
    for (const company of randomCompanies) {
      await prisma.youthApplicationCompanyInterest.create({
        data: {
          applicationId: youthApplication.id,
          companyId: company.id,
          status: ['INTERESTED', 'CONTACTED', 'INTERVIEW_SCHEDULED'][Math.floor(Math.random() * 3)] as any,
          interestedAt: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
          notes: 'Empresa interesada en el perfil del candidato',
        },
      });
    }

    console.log(`✅ Aplicación de joven creada para ${youth.profile!.firstName}`);
  }

  // Crear emprendimientos para usuarios jóvenes
  for (let i = 0; i < youthUsers.length; i++) {
    const youth = youthUsers[i];
    const entrepreneurshipInfo = entrepreneurshipData[i];
    
    const entrepreneurship = await prisma.entrepreneurship.create({
      data: {
        ownerId: youth.profile!.userId,
        name: entrepreneurshipInfo.name,
        description: entrepreneurshipInfo.description,
        category: entrepreneurshipInfo.category,
        subcategory: entrepreneurshipInfo.subcategory,
        businessStage: entrepreneurshipInfo.businessStage,
        logo: `https://via.placeholder.com/200x200/6366F1/FFFFFF?text=${encodeURIComponent(entrepreneurshipInfo.name.split(' ')[0])}`,
        images: [
          `https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=${encodeURIComponent(entrepreneurshipInfo.name)}`,
          `https://via.placeholder.com/400x300/059669/FFFFFF?text=${encodeURIComponent(entrepreneurshipInfo.category)}`,
        ],
        website: entrepreneurshipInfo.website,
        email: entrepreneurshipInfo.email,
        phone: entrepreneurshipInfo.phone,
        address: entrepreneurshipInfo.address,
        municipality: entrepreneurshipInfo.municipality,
        department: 'Cochabamba',
        socialMedia: entrepreneurshipInfo.socialMedia,
        founded: entrepreneurshipInfo.founded,
        employees: entrepreneurshipInfo.employees,
        annualRevenue: entrepreneurshipInfo.annualRevenue,
        businessModel: entrepreneurshipInfo.businessModel,
        targetMarket: entrepreneurshipInfo.targetMarket,
        isPublic: true,
        isActive: true,
        viewsCount: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        reviewsCount: Math.floor(Math.random() * 20),
      },
    });

    console.log(`✅ Emprendimiento creado: ${entrepreneurship.name} para ${youth.profile!.firstName}`);
  }

  // Crear mensajes entre usuarios
  for (let i = 0; i < youthUsers.length; i++) {
    const youth = youthUsers[i];
    const company = companies[i % companies.length];
    
    // Buscar el perfil de usuario de la empresa
    const companyUser = await prisma.user.findFirst({
      where: { 
        email: company.email,
        role: 'COMPANIES'
      },
      include: { profile: true }
    });

    if (companyUser?.profile) {
      // Mensaje del joven a la empresa
      await prisma.message.create({
        data: {
          senderId: youth.profile!.userId,
          recipientId: companyUser.profile.userId,
          content: `Hola, me interesa mucho trabajar en ${company.name}. ¿Podrían revisar mi aplicación?`,
          messageType: 'text',
          contextType: 'JOB_APPLICATION',
          createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        },
      });

      // Respuesta de la empresa
      await prisma.message.create({
        data: {
          senderId: companyUser.profile.userId,
          recipientId: youth.profile!.userId,
          content: `Hola ${youth.profile!.firstName}, hemos revisado tu aplicación y nos interesa tu perfil. Te contactaremos pronto para una entrevista.`,
          messageType: 'text',
          contextType: 'JOB_APPLICATION',
          createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
          readAt: new Date(Date.now() - Math.random() * 1 * 24 * 60 * 60 * 1000),
        },
      });

      console.log(`✅ Mensajes creados entre ${youth.profile!.firstName} y ${company.name}`);
    }
  }

  // Crear noticias
  for (const newsDataItem of newsData) {
    let authorUser = admin; // Por defecto usar admin
    
    if (newsDataItem.authorType === 'INSTITUTION') {
      // Buscar institución por nombre
      const institution = institutions.find(inst => 
        inst.name.includes(newsDataItem.title.split(' ')[0]) ||
        newsDataItem.title.includes(inst.name.split(' ')[0])
      );
      
      if (institution) {
        // Buscar el usuario de la institución
        const institutionUser = await prisma.user.findFirst({
          where: { 
            email: institution.email,
            role: 'INSTITUTION'
          }
        });
        if (institutionUser) {
          authorUser = institutionUser;
        }
      }
    } else if (newsDataItem.authorType === 'COMPANY') {
      // Buscar empresa por nombre
      const company = companies.find(comp => 
        comp.name.includes(newsDataItem.title.split(' ')[0]) ||
        newsDataItem.title.includes(comp.name.split(' ')[0])
      );
      
      if (company) {
        // Buscar el usuario de la empresa
        const companyUser = await prisma.user.findFirst({
          where: { 
            email: company.email,
            role: 'COMPANIES'
          }
        });
        if (companyUser) {
          authorUser = companyUser;
        }
      }
    }

    const newsArticle = await prisma.newsArticle.create({
      data: {
        title: newsDataItem.title,
        content: newsDataItem.content,
        summary: newsDataItem.summary,
        imageUrl: `https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=${encodeURIComponent(newsDataItem.title.split(' ')[0])}`,
        authorId: authorUser.id,
        authorName: authorUser.profile?.firstName ? `${authorUser.profile.firstName} ${authorUser.profile.lastName}` : authorUser.email,
        authorType: newsDataItem.authorType,
        status: newsDataItem.status,
        priority: newsDataItem.priority,
        featured: newsDataItem.featured,
        tags: newsDataItem.tags,
        category: newsDataItem.category,
        publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        viewCount: Math.floor(Math.random() * 200),
        likeCount: Math.floor(Math.random() * 50),
        commentCount: Math.floor(Math.random() * 20),
        targetAudience: newsDataItem.targetAudience,
        region: newsDataItem.region,
        isEntrepreneurshipRelated: newsDataItem.isEntrepreneurshipRelated,
      },
    });

    console.log(`✅ Noticia creada: ${newsArticle.title}`);
  }

  // Crear recursos
  for (const resourceData of resourcesData) {
    const resource = await prisma.resource.create({
      data: {
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        format: resourceData.format,
        downloadUrl: `https://example.com/resources/${resourceData.title.toLowerCase().replace(/\s+/g, '-')}.${resourceData.format.toLowerCase()}`,
        thumbnail: `https://via.placeholder.com/300x200/6366F1/FFFFFF?text=${encodeURIComponent(resourceData.title.split(' ')[0])}`,
        author: resourceData.author,
        publishedDate: resourceData.publishedDate,
        downloads: Math.floor(Math.random() * 100),
        rating: Math.random() * 5,
        tags: resourceData.tags,
        isPublic: true,
        isEntrepreneurshipRelated: resourceData.isEntrepreneurshipRelated,
        createdByUserId: admin.id,
        status: 'PUBLISHED',
      },
    });

    console.log(`✅ Recurso creado: ${resource.title}`);
  }

  console.log('🎉 Seed completo finalizado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - ${institutions.length} instituciones creadas`);
  console.log(`   - ${companies.length} empresas creadas`);
  console.log(`   - ${youthUsers.length} usuarios jóvenes creados`);
  console.log(`   - ${youthUsers.length} emprendimientos creados`);
  console.log(`   - ${courses.length} cursos creados`);
  console.log(`   - ${jobOffers.length} ofertas de trabajo creadas`);
  console.log(`   - ${newsData.length} noticias creadas`);
  console.log(`   - ${resourcesData.length} recursos creados`);

  // Resumen detallado de usuarios creados
  console.log('\n👥 RESUMEN DE USUARIOS CREADOS:');
  console.log('=' .repeat(60));
  
  // Usuario administrador
  console.log('\n🔑 SUPER ADMINISTRADOR:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Contraseña: 12345678`);
  console.log(`   Rol: ${admin.role}`);
  
  // Usuarios de instituciones
  console.log('\n🏛️ USUARIOS DE INSTITUCIONES:');
  for (const institution of institutions) {
    const institutionUser = await prisma.user.findFirst({
      where: { email: institution.email },
      include: { profile: true }
    });
    
    if (institutionUser) {
      console.log(`   📧 ${institution.name}:`);
      console.log(`      Email: ${institutionUser.email}`);
      console.log(`      Contraseña: 12345678`);
      console.log(`      Tipo: ${institution.institutionType}`);
      console.log(`      Municipio: ${institution.department}`);
    }
  }
  
  // Usuarios de empresas
  console.log('\n🏢 USUARIOS DE EMPRESAS:');
  for (const company of companies) {
    const companyUser = await prisma.user.findFirst({
      where: { email: company.email },
      include: { profile: true }
    });
    
    if (companyUser) {
      console.log(`   📧 ${company.name}:`);
      console.log(`      Email: ${companyUser.email}`);
      console.log(`      Contraseña: 12345678`);
      console.log(`      Sector: ${company.businessSector}`);
      console.log(`      Tamaño: ${company.companySize}`);
    }
  }
  
  // Usuarios jóvenes
  console.log('\n👨‍🎓 USUARIOS JÓVENES:');
  for (let i = 0; i < youthUsers.length; i++) {
    const youth = youthUsers[i];
    const entrepreneurshipInfo = entrepreneurshipData[i];
    
    console.log(`   📧 ${youth.profile!.firstName} ${youth.profile!.lastName}:`);
    console.log(`      Email: ${youth.email}`);
    console.log(`      Contraseña: 12345678`);
    console.log(`      Ciudad: ${youth.profile!.city}`);
    console.log(`      Educación: ${youth.profile!.educationLevel}`);
    console.log(`      Experiencia: ${youth.profile!.experienceLevel}`);
    console.log(`      Posición objetivo: ${youth.profile!.targetPosition}`);
    console.log(`      🚀 Emprendimiento: ${entrepreneurshipInfo.name}`);
    console.log(`         Categoría: ${entrepreneurshipInfo.category}`);
    console.log(`         Etapa: ${entrepreneurshipInfo.businessStage}`);
    console.log(`         Empleados: ${entrepreneurshipInfo.employees || 'N/A'}`);
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('💡 NOTA: Todos los usuarios tienen la contraseña: 12345678');
  console.log('🔗 Puedes usar estas credenciales para probar el sistema');
  console.log('=' .repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
