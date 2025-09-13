"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Briefcase, Users, Building2, GraduationCap, Lightbulb } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">CEMSE</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/courses" className="text-gray-600 hover:text-gray-900">
                Cursos
              </Link>
              <Link href="/jobs" className="text-gray-600 hover:text-gray-900">
                Empleos
              </Link>
              <Link href="/entrepreneurship" className="text-gray-600 hover:text-gray-900">
                Emprendimiento
              </Link>
              <Link href="/news" className="text-gray-600 hover:text-gray-900">
                Noticias
              </Link>
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
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Plataforma Completa de
              <span className="text-blue-600"> Educación y Empleo</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Conectamos a jóvenes con oportunidades de educación, empleo y emprendimiento 
              para construir un futuro mejor en Bolivia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">Comenzar Ahora</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/courses">Explorar Cursos</Link>
              </Button>
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
