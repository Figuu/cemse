"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Briefcase, Users, Building2, GraduationCap, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [entrepreneurships, setEntrepreneurships] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Images from /public/images folder
  const images = [
    "/images/1.jpg",
    "/images/3.jpg", 
    "/images/4.JPG",
    "/images/5.jpg",
    "/images/6.JPG",
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg"
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

  useEffect(() => {
    if (status === "loading") return;
    if (session) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

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

  if (session) {
    return null; // Will redirect to dashboard
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Partner Logos Section */}
      <section className="py-4 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-6 md:space-x-8">
            <img 
              src="/logos/1.png" 
              alt="Partner Logo 1" 
              className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src="/logos/2.png" 
              alt="Partner Logo 2" 
              className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src="/logos/3.png" 
              alt="Partner Logo 3" 
              className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src="/logos/4.png" 
              alt="Partner Logo 4" 
              className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
            <img 
              src="/logos/5.png" 
              alt="Partner Logo 5" 
              className="h-6 md:h-8 w-auto opacity-60 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </div>
      </section>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CEMSE</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <button 
                onClick={() => document.getElementById('bolsa-empleo')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Bolsa de Empleo
              </button>
              <button 
                onClick={() => document.getElementById('emprendimiento')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Emprendimiento
              </button>
              <button 
                onClick={() => document.getElementById('capacitaciones')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Capacitaciones
              </button>
              <button 
                onClick={() => document.getElementById('necesitas-apoyo')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ¿Necesitas Apoyo?
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/sign-in">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Plataforma Completa de
                <span className="text-blue-600"> Educación y Empleo</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto lg:mx-0">
                Conectamos a jóvenes con oportunidades de educación, empleo y emprendimiento 
                para construir un futuro mejor en Bolivia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/sign-up">Comenzar Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Explorar Cursos</Link>
                </Button>
              </div>
            </div>

            {/* Image Carousel */}
            <div className="relative">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Qué ofrecemos?
            </h2>
            <p className="text-xl text-gray-600">
              Una plataforma integral para el desarrollo personal y profesional
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Educación</CardTitle>
                <CardDescription>
                  Cursos especializados con certificación automática
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Cursos de habilidades blandas</li>
                  <li>• Competencias básicas</li>
                  <li>• Alfabetización digital</li>
                  <li>• Liderazgo y comunicación</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Empleo</CardTitle>
                <CardDescription>
                  Conectamos talento con oportunidades laborales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ofertas de trabajo</li>
                  <li>• Postulaciones abiertas</li>
                  <li>• Constructor de CV</li>
                  <li>• Chat con empresas</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Emprendimiento</CardTitle>
                <CardDescription>
                  Red de emprendedores y recursos especializados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Red de emprendedores</li>
                  <li>• Recursos especializados</li>
                  <li>• Planes de negocio</li>
                  <li>• Networking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Instituciones</CardTitle>
                <CardDescription>
                  Gestión completa para municipios y ONGs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Gestión de usuarios</li>
                  <li>• Creación de contenido</li>
                  <li>• Reportes y estadísticas</li>
                  <li>• Administración completa</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Empresas</CardTitle>
                <CardDescription>
                  Herramientas para reclutamiento y gestión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Publicar ofertas</li>
                  <li>• Gestionar aplicaciones</li>
                  <li>• Chat con candidatos</li>
                  <li>• Reportes de contratación</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>Jóvenes</CardTitle>
                <CardDescription>
                  Desarrollo integral y oportunidades de crecimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Perfil personalizado</li>
                  <li>• Seguimiento de progreso</li>
                  <li>• Certificaciones</li>
                  <li>• Comunidad activa</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Bolsa de Empleo Section */}
      <section id="bolsa-empleo" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Bolsa de Empleo
            </h2>
            <p className="text-xl text-gray-600">
              Encuentra las mejores oportunidades laborales
            </p>
          </div>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job: any) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
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
                        {job.type}
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
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Ver Todas las Ofertas</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Emprendimiento Section */}
      <section id="emprendimiento" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Emprendimiento
            </h2>
            <p className="text-xl text-gray-600">
              Conecta con emprendedores y haz crecer tu negocio
            </p>
          </div>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entrepreneurships.map((entrepreneurship: any) => (
                <Card key={entrepreneurship.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{entrepreneurship.name}</CardTitle>
                    <CardDescription>
                      {entrepreneurship.category} • {entrepreneurship.businessStage}
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
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Explorar Emprendimientos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Capacitaciones Section */}
      <section id="capacitaciones" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Capacitaciones
            </h2>
            <p className="text-xl text-gray-600">
              Desarrolla tus habilidades con nuestros cursos especializados
            </p>
          </div>
          
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      {course.category} • {course.level}
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
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Ver Todos los Cursos</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ¿Necesitas Apoyo? Section */}
      <section id="necesitas-apoyo" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Necesitas Apoyo?
            </h2>
            <p className="text-xl text-gray-600">
              Estamos aquí para ayudarte en tu camino hacia el éxito
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
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

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-green-600" />
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

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
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
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/sign-up">Obtener Ayuda</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar tu viaje?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
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
              <h3 className="text-lg font-semibold mb-4">CEMSE</h3>
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
            <p>&copy; 2024 CEMSE. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
