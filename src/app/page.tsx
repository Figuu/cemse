"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Briefcase, Users, Building2, GraduationCap, Lightbulb, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LandingHeader } from "@/components/LandingHeader";
import { motion, AnimatePresence, useInView } from "framer-motion";

// Business Stage translations
const businessStageLabels: Record<string, string> = {
  IDEA: "Idea",
  STARTUP: "Inicio",
  GROWING: "Crecimiento",
  ESTABLISHED: "Establecido",
  GROWTH: "Crecimiento",
  MATURE: "Maduro",
  SCALE: "Escala"
};

// Employment Type translations
const employmentTypeLabels: Record<string, string> = {
  FULL_TIME: "Tiempo completo",
  PART_TIME: "Medio tiempo",
  CONTRACT: "Contrato",
  INTERNSHIP: "Pasantía",
  FREELANCE: "Freelance",
  TEMPORARY: "Temporal"
};

// Course Level translations
const courseLevelLabels: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
  EXPERT: "Experto"
};

// Course Category translations
const courseCategoryLabels: Record<string, string> = {
  TECHNOLOGY: "Tecnología",
  BUSINESS: "Negocios",
  DESIGN: "Diseño",
  MARKETING: "Marketing",
  LANGUAGES: "Idiomas",
  HEALTH: "Salud",
  EDUCATION: "Educación",
  PERSONAL_DEVELOPMENT: "Desarrollo Personal",
  ARTS: "Artes",
  SCIENCE: "Ciencia"
};

// Entrepreneurship Category translations
const entrepreneurshipCategoryLabels: Record<string, string> = {
  TECHNOLOGY: "Tecnología",
  SERVICES: "Servicios",
  COMMERCE: "Comercio",
  FOOD: "Alimentos",
  EDUCATION: "Educación",
  HEALTH: "Salud",
  TOURISM: "Turismo",
  AGRICULTURE: "Agricultura",
  MANUFACTURING: "Manufactura",
  SOCIAL: "Social",
  RETAIL: "Retail",
  CONSULTING: "Consultoría",
  ENTERTAINMENT: "Entretenimiento",
  FASHION: "Moda",
  SPORTS: "Deportes"
};

// Animated Section Component
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

// Feature card data
const features = [
  {
    id: 'education',
    icon: BookOpen,
    title: 'Educación',
    shortDescription: 'Cursos con certificación',
    bgColor: 'bg-secondary',
    iconColor: 'text-primary',
    modalContent: {
      title: 'Educación y Capacitación',
      description: 'Accede a cursos especializados diseñados para impulsar tu desarrollo profesional.',
      features: [
        '📚 Cursos de habilidades blandas',
        '🎯 Competencias básicas laborales',
        '💻 Alfabetización digital',
        '🗣️ Liderazgo y comunicación',
        '🎓 Certificación automática al completar',
        '📖 Material de estudio descargable',
        '✅ Evaluaciones y cuestionarios',
        '📈 Seguimiento de progreso'
      ],
      cta: 'Explorar Cursos',
      link: '/courses'
    }
  },
  {
    id: 'employment',
    icon: Briefcase,
    title: 'Empleo',
    shortDescription: 'Oportunidades laborales',
    bgColor: 'bg-green/20',
    iconColor: 'text-green',
    modalContent: {
      title: 'Bolsa de Empleo',
      description: 'Conectamos tu talento con oportunidades laborales en Bolivia.',
      features: [
        '💼 Ofertas de trabajo actualizadas',
        '📝 Constructor de CV profesional',
        '💬 Chat directo con empresas',
        '📋 Gestión de postulaciones',
        '🏢 Perfiles de empresas',
        '📍 Búsqueda por ubicación',
        '💰 Información de salarios',
        '📅 Programación de entrevistas'
      ],
      cta: 'Buscar Empleos',
      link: '/jobs'
    }
  },
  {
    id: 'entrepreneurship',
    icon: Lightbulb,
    title: 'Emprendimiento',
    shortDescription: 'Red de emprendedores',
    bgColor: 'bg-orange/20',
    iconColor: 'text-orange',
    modalContent: {
      title: 'Red de Emprendedores',
      description: 'Conecta con otros emprendedores y haz crecer tu negocio.',
      features: [
        '🚀 Generador de planes de negocio',
        '🤝 Red de networking activa',
        '📚 Biblioteca de recursos',
        '💡 Compartir ideas y proyectos',
        '📊 Calculadora de presupuestos',
        '📰 Noticias del ecosistema',
        '🌐 Directorio de emprendimientos',
        '💬 Mensajería entre emprendedores'
      ],
      cta: 'Unirme a la Red',
      link: '/entrepreneurship'
    }
  },
  {
    id: 'institutions',
    icon: Building2,
    title: 'Instituciones',
    shortDescription: 'Gestión completa',
    bgColor: 'bg-blue-dark/20',
    iconColor: 'text-blue-dark',
    modalContent: {
      title: 'Portal Institucional',
      description: 'Herramientas para la gestión de municipios y ONGs.',
      features: [
        '👥 Gestión de usuarios y estudiantes',
        '📝 Creación de cursos y contenido',
        '📊 Panel de administración',
        '🎯 Seguimiento de programas',
        '🎓 Emisión de certificados',
        '📚 Gestión de programas educativos',
        '👨‍🏫 Asignación de instructores',
        '📅 Calendario de actividades'
      ],
      cta: 'Ver más',
      link: '/institutions'
    }
  },
  {
    id: 'companies',
    icon: Users,
    title: 'Empresas',
    shortDescription: 'Reclutamiento eficiente',
    bgColor: 'bg-destructive/20',
    iconColor: 'text-destructive',
    modalContent: {
      title: 'Portal Empresarial',
      description: 'Encuentra el talento que tu empresa necesita.',
      features: [
        '📢 Publicación de ofertas de trabajo',
        '👥 Búsqueda de candidatos',
        '💬 Chat con candidatos',
        '📝 Gestión de aplicaciones',
        '🏢 Perfil completo de empresa',
        '📊 Panel de control empresarial',
        '👔 Gestión de empleados',
        '📅 Programación de entrevistas'
      ],
      cta: 'Registrar Empresa',
      link: '/companies'
    }
  },
  {
    id: 'youth',
    icon: GraduationCap,
    title: 'Jóvenes',
    shortDescription: 'Desarrollo integral',
    bgColor: 'bg-secondary',
    iconColor: 'text-primary',
    modalContent: {
      title: 'Portal Juvenil',
      description: 'Todo lo que necesitas para construir tu futuro profesional.',
      features: [
        '👤 Perfil profesional completo',
        '📈 Seguimiento de tu progreso',
        '🎓 Certificados de cursos completados',
        '👥 Comunidad de jóvenes activa',
        '💼 Aplicación a ofertas laborales',
        '📚 Acceso a todos los cursos',
        '💬 Foros de discusión',
        '🎯 Rutas de aprendizaje'
      ],
      cta: 'Comenzar Ahora',
      link: '/sign-up'
    }
  }
];

// Feature Section Component
function FeatureSection() {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedFeature(null);
      }
    };

    if (selectedFeature) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedFeature]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100
      }
    }
  };

  return (
    <section ref={sectionRef} className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Qué ofrecemos?
          </h2>
          <p className="text-lg text-gray-600">
            Descubre todo lo que puedes lograr
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={cardVariants}
                whileHover={{
                  scale: 1.03,
                  transition: { duration: 0.2 }
                }}
                className="relative"
              >
                <Card
                  className="h-full cursor-pointer border-2 hover:border-primary/30 transition-all duration-300 group"
                  onClick={() => setSelectedFeature(feature.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <motion.div
                      className={`mx-auto w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </motion.div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group-hover:text-primary transition-colors"
                    >
                      Click para más detalles
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>

              </motion.div>
            );
          })}
        </motion.div>

        {/* Centralized Modal Overlay */}
        <AnimatePresence>
          {selectedFeature && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                onClick={() => setSelectedFeature(null)}
              />

              {/* Modal Container */}
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="w-[90%] max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8
                           max-h-[85vh] overflow-y-auto relative pointer-events-auto mx-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedFeature(null)}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Modal content */}
                  {(() => {
                    const feature = features.find(f => f.id === selectedFeature);
                    if (!feature) return null;
                    const Icon = feature.icon;

                    return (
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-8 h-8 ${feature.iconColor}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {feature.modalContent.title}
                            </h3>
                            <p className="text-gray-600">
                              {feature.modalContent.description}
                            </p>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {feature.modalContent.features.map((item, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="text-sm text-gray-700 flex items-start bg-gray-50 rounded-lg p-3"
                            >
                              <span>{item}</span>
                            </motion.div>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <Button asChild className="w-full sm:w-auto" size="lg">
                          <Link href={feature.modalContent.link}>
                            {feature.modalContent.cta}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    );
                  })()}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default function Home() {
  const { status } = useSession();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [entrepreneurships, setEntrepreneurships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Images from /public/images folder
  const images = [
    "/images/1.jpg",
    "/images/(1).JPG",
    "/images/(2).JPG",
    "/images/(3).JPG",
    "/images/(4).JPG",
    "/images/(5).JPG",
    "/images/(6).JPG",
    "/images/(7).JPG",
    "/images/(8).JPG",
    "/images/(9).JPG",
    "/images/(10).JPG",
    "/images/(11).JPG",
    "/images/(12).JPG",
    "/images/(13).JPG",
    "/images/(14).JPG",
    "/images/(15).JPG",
    "/images/(16).JPG",
    "/images/(17).JPG",
    "/images/(18).JPG",
    "/images/(19).JPG",
    "/images/(20).JPG",
    "/images/(21).JPG",
    "/images/(22).JPG",
    "/images/(23).JPG",
    "/images/(24).JPG",
    "/images/(25).JPG",
    "/images/(26).JPG",
    "/images/(27).JPG",
    "/images/(28).JPG",
    "/images/(29).JPG",
    "/images/(30).JPG",
  ];

  // Fetch data for sections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, entrepreneurshipsResponse, coursesResponse] = await Promise.all([
          fetch('/api/public/jobs?limit=6'),
          fetch('/api/public/entrepreneurships?limit=6'),
          fetch('/api/public/courses?limit=6')
        ]);

        const [jobsData, entrepreneurshipsData, coursesData] = await Promise.all([
          jobsResponse.json(),
          entrepreneurshipsResponse.json(),
          coursesResponse.json()
        ]);

        if (jobsData.success) setJobs(jobsData.jobs);
        if (entrepreneurshipsData.success) setEntrepreneurships(entrepreneurshipsData.entrepreneurships);
        if (coursesData.success) setCourses(coursesData.courses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Partner Logos Section */}
      <section className="py-4 sm:py-6 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile: Static layout - Solo logo gob */}
          <div className="block sm:hidden">
            <div className="flex justify-center items-center">
              <Image
                src="/logos/gob.png"
                alt="Gobierno"
                width={200}
                height={200}
                className="h-12 w-auto object-contain opacity-70"
              />
            </div>
          </div>
          
          {/* Desktop: Static layout - Solo logo gob */}
          <div className="hidden sm:flex justify-center items-center">
            <Image
              src="/logos/gob.png"
              alt="Gobierno"
              width={200}
              height={200}
              className="h-10 md:h-12 lg:h-14 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      {/* Header */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2
              }}
            >
              <motion.h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Plataforma Completa de
                <motion.span
                  className="text-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                > Educación y Empleo</motion.span>
              </motion.h1>
              <motion.p
                className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Conectamos a jóvenes con oportunidades de educación, empleo y emprendimiento
                para construir un futuro mejor en Bolivia.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Button size="lg" asChild>
                  <Link href="/sign-up">Comenzar Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Image Carousel */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.6
              }}
            >
              <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={images[currentImageIndex]}
                  alt={`Hero image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover transition-opacity duration-500"
                  priority={currentImageIndex === 0}
                />
                
                {/* Navigation Arrows */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 shadow-lg transition-all duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentImageIndex 
                          ? 'bg-white shadow-lg' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Hover Modals */}
      <FeatureSection />

      {/* Ejecutado por Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ejecutado por:
            </h2>
          </div>

          {/* Mobile: Auto-scrolling carousel - Primer plano */}
          <div className="block sm:hidden">
            <div className="overflow-hidden">
              <div className="flex animate-scroll gap-4">
                <Image
                  src="/logos/cemse.png"
                  alt="CEMSE"
                  width={200}
                  height={200}
                  className="h-8 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/kallpa.png"
                  alt="Kallpa"
                  width={200}
                  height={200}
                  className="h-10 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/manqa.png"
                  alt="Manqa"
                  width={200}
                  height={200}
                  className="h-12 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/childfund.png"
                  alt="ChildFund"
                  width={200}
                  height={200}
                  className="h-8 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/stc.png"
                  alt="STC"
                  width={200}
                  height={200}
                  className="h-6 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/40.png"
                  alt="40"
                  width={200}
                  height={200}
                  className="h-10 w-auto object-contain opacity-60 flex-shrink-0"
                />
                {/* Duplicate for seamless loop */}
                <Image
                  src="/logos/cemse.png"
                  alt="CEMSE"
                  width={200}
                  height={200}
                  className="h-8 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/kallpa.png"
                  alt="Kallpa"
                  width={200}
                  height={200}
                  className="h-10 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/manqa.png"
                  alt="Manqa"
                  width={200}
                  height={200}
                  className="h-12 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/childfund.png"
                  alt="ChildFund"
                  width={200}
                  height={200}
                  className="h-8 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/stc.png"
                  alt="STC"
                  width={200}
                  height={200}
                  className="h-6 w-auto object-contain opacity-60 flex-shrink-0"
                />
                <Image
                  src="/logos/40.png"
                  alt="40"
                  width={200}
                  height={200}
                  className="h-10 w-auto object-contain opacity-60 flex-shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Desktop: Static layout - Primer plano */}
          <div className="hidden sm:flex justify-center items-center gap-3 md:gap-4 lg:gap-6">
            <Image
              src="/logos/cemse.png"
              alt="CEMSE"
              width={200}
              height={200}
              className="h-14 md:h-16 lg:h-18 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <Image
              src="/logos/kallpa.png"
              alt="Kallpa"
              width={200}
              height={200}
              className="h-16 md:h-18 lg:h-20 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <Image
              src="/logos/manqa.png"
              alt="Manqa"
              width={200}
              height={200}
              className="h-16 md:h-18 lg:h-20 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <Image
              src="/logos/childfund.png"
              alt="ChildFund"
              width={200}
              height={200}
              className="h-8 md:h-10 lg:h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <Image
              src="/logos/stc.png"
              alt="STC"
              width={200}
              height={200}
              className="h-12 md:h-14 lg:h-16 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <Image
              src="/logos/40.png"
              alt="40"
              width={200}
              height={200}
              className="h-14 md:h-16 lg:h-18 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      {/* Bolsa de Empleo Section */}
      <section id="bolsa-empleo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bolsa de Empleo
            </h2>
            <p className="text-xl text-gray-600">
              Encuentra las mejores oportunidades laborales
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {jobs.map((job: any) => (
                  <motion.div
                    key={job.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {job.company.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {employmentTypeLabels[job.type] || employmentTypeLabels[job.employmentType] || job.type || job.employmentType}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {job.location}
                      </p>
                      {job.salary && (
                        <p className="font-medium text-green-600">
                          {job.salary.currency} {job.salary.min} - {job.salary.max}
                        </p>
                      )}
                    </div>
                    <Button className="w-full mt-4" asChild>
                      <Link href="/sign-up">Ver Detalles</Link>
                    </Button>
                  </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Ver Todas las Ofertas</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Emprendimiento Section */}
      <section id="emprendimiento" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emprendimiento
            </h2>
            <p className="text-xl text-gray-600">
              Conecta con emprendedores y haz crecer tu negocio
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {entrepreneurships.map((entrepreneurship: any) => (
                  <motion.div
                    key={entrepreneurship.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{entrepreneurship.name}</CardTitle>
                    <CardDescription>
                      {entrepreneurshipCategoryLabels[entrepreneurship.category] || entrepreneurship.category} • {businessStageLabels[entrepreneurship.businessStage] || entrepreneurship.businessStage}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {entrepreneurship.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Users className="w-4 h-4" />
                      {entrepreneurship.owner.firstName} {entrepreneurship.owner.lastName}
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/sign-up">Conectar</Link>
                    </Button>
                  </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Explorar Emprendimientos</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Capacitaciones Section */}
      <section id="capacitaciones" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Capacitaciones
            </h2>
            <p className="text-xl text-gray-600">
              Desarrolla tus habilidades con nuestros cursos especializados
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {courses.map((course: any) => (
                  <motion.div
                    key={course.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      {courseCategoryLabels[course.category] || course.category} • {courseLevelLabels[course.level] || course.level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {course.shortDescription || course.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course.duration} horas
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.totalEnrollments} estudiantes
                      </span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href="/sign-up">Inscribirse</Link>
                    </Button>
                  </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatedSection>

          <AnimatedSection delay={0.3} className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Ver Todos los Cursos</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* ¿Necesitas Apoyo? Section */}
      <section id="necesitas-apoyo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Necesitas Apoyo?
            </h2>
            <p className="text-xl text-gray-600">
              Estamos aquí para ayudarte en tu camino hacia el éxito
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Mentoría Personalizada</CardTitle>
                    <CardDescription>
                      Conecta con mentores experimentados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Orientación profesional</li>
                      <li>• Desarrollo de habilidades</li>
                      <li>• Networking estratégico</li>
                      <li>• Planificación de carrera</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-green/20 rounded-lg flex items-center justify-center mb-4">
                      <Lightbulb className="w-6 h-6 text-green" />
                    </div>
                    <CardTitle>Recursos Educativos</CardTitle>
                    <CardDescription>
                      Acceso a materiales y herramientas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Guías y tutoriales</li>
                      <li>• Plantillas descargables</li>
                      <li>• Webinars exclusivos</li>
                      <li>• Biblioteca digital</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-orange/20 rounded-lg flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-orange" />
                    </div>
                    <CardTitle>Soporte Técnico</CardTitle>
                    <CardDescription>
                      Asistencia cuando la necesites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Chat en vivo</li>
                      <li>• Base de conocimientos</li>
                      <li>• Soporte por email</li>
                      <li>• Tutoriales paso a paso</li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </AnimatedSection>
          <AnimatedSection delay={0.3} className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Obtener Ayuda</Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Financiado por Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Financiado por:
            </h2>
          </div>

          {/* Mobile: Auto-scrolling carousel - Socios estratégicos */}
          <div className="block sm:hidden">
            <div className="overflow-hidden">
              <div className="flex animate-scroll gap-3">
                <Image 
                  src="/logos/bvlgari.png" 
                  alt="Bulgari" 
                  width={200}
                  height={200}
                  className="h-3 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/stc.png" 
                  alt="STC" 
                  width={200}
                  height={200}
                  className="h-4 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/40.png" 
                  alt="40" 
                  width={200}
                  height={200}
                  className="h-6 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/maria.png" 
                  alt="Maria" 
                  width={200}
                  height={200}
                  className="h-3 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/childfund.png" 
                  alt="ChildFund" 
                  width={200}
                  height={200}
                  className="h-5 w-auto object-contain opacity-40 flex-shrink-0"
                />
                {/* Duplicate for seamless loop */}
                <Image 
                  src="/logos/bvlgari.png" 
                  alt="Bulgari" 
                  width={200}
                  height={200}
                  className="h-3 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/stc.png" 
                  alt="STC" 
                  width={200}
                  height={200}
                  className="h-4 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/40.png" 
                  alt="40" 
                  width={200}
                  height={200}
                  className="h-6 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/maria.png" 
                  alt="Maria" 
                  width={200}
                  height={200}
                  className="h-3 w-auto object-contain opacity-40 flex-shrink-0"
                />
                <Image 
                  src="/logos/childfund.png" 
                  alt="ChildFund" 
                  width={200}
                  height={200}
                  className="h-5 w-auto object-contain opacity-40 flex-shrink-0"
                />
              </div>
            </div>
          </div>

          {/* Desktop: Static layout - Socios estratégicos */}
          <div className="hidden sm:flex justify-center items-center gap-2 md:gap-3 lg:gap-4">
            <Image 
              src="/logos/bvlgari.png" 
              alt="Bulgari" 
              width={200}
              height={200}
              className="h-4 md:h-5 lg:h-6 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity duration-300"
            />
            <Image 
              src="/logos/stc.png" 
              alt="STC" 
              width={200}
              height={200}
              className="h-10 md:h-12 lg:h-14 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity duration-300"
            />
            <Image 
              src="/logos/40.png" 
              alt="40" 
              width={200}
              height={200}
              className="h-10 md:h-12 lg:h-14 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity duration-300"
            />
            <Image 
              src="/logos/maria.png" 
              alt="Maria" 
              width={200}
              height={200}
              className="h-6 md:h-8 lg:h-10 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity duration-300"
            />
            <Image 
              src="/logos/childfund.png" 
              alt="ChildFund" 
              width={200}
              height={200}
              className="h-8 md:h-10 lg:h-12 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar tu viaje?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Únete a miles de jóvenes que ya están construyendo su futuro
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/sign-up">Registrarse Gratis</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Emplea y Emprende</h3>
              <p className="text-gray-400">
                Plataforma integral de educación, empleo y emprendimiento para jóvenes.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/courses">Cursos</Link></li>
                <li><Link href="/jobs">Empleos</Link></li>
                <li><Link href="/entrepreneurship">Emprendimiento</Link></li>
                <li><Link href="/news">Noticias</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/resources">Recursos</Link></li>
                <li><Link href="/help">Ayuda</Link></li>
                <li><Link href="/contact">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy">Privacidad</Link></li>
                <li><Link href="/terms">Términos</Link></li>
                <li><Link href="/cookies">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Emplea y Emprende. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
