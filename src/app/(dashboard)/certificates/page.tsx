"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Award, 
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateCard } from "@/components/courses/CertificateCard";
import { CertificateViewer } from "@/components/courses/CertificateViewer";
import { Certificate } from "@/hooks/useCertificates";

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const {
    certificates,
    isLoading,
    error,
    refetch,
    downloadCertificate,
  } = useCertificates();

  const filteredCertificates = certificates.filter(certificate => {
    const matchesSearch = 
      certificate.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (certificate.module && certificate.module.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      certificate.student.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || certificate.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const courseCertificates = filteredCertificates.filter(cert => cert.type === "course");
  const moduleCertificates = filteredCertificates.filter(cert => cert.type === "module");

  const handleViewCertificate = (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    if (certificate) {
      setSelectedCertificate(certificate);
      setShowViewer(true);
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    await downloadCertificate(certificateId);
  };

  const handleShareCertificate = (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    if (certificate) {
      navigator.clipboard.writeText(certificate.certificateUrl);
      // You could add a toast notification here
    }
  };

  const handleBack = () => {
    setShowViewer(false);
    setSelectedCertificate(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificados</h1>
            <p className="text-muted-foreground">Gestiona tus certificados de completación</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificados</h1>
            <p className="text-muted-foreground">Gestiona tus certificados de completación</p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error al cargar certificados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showViewer && selectedCertificate) {
    return (
      <CertificateViewer
        certificate={selectedCertificate}
        onDownload={handleDownloadCertificate}
        onShare={handleShareCertificate}
        onBack={handleBack}
      />
    );
  }

  return (
    <RoleGuard allowedRoles={["YOUTH", "COMPANIES", "INSTITUTION", "ADMIN", "INSTRUCTOR"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificados</h1>
            <p className="text-muted-foreground">
              Gestiona tus certificados de completación
            </p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generar Certificado
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar certificados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="course">Cursos</option>
                  <option value="module">Módulos</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{certificates.length}</div>
              <div className="text-sm text-muted-foreground">Total Certificados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{courseCertificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificados de Curso</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="text-center py-4">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{moduleCertificates.length}</div>
              <div className="text-sm text-muted-foreground">Certificados de Módulo</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todos ({filteredCertificates.length})</TabsTrigger>
            <TabsTrigger value="courses">Cursos ({courseCertificates.length})</TabsTrigger>
            <TabsTrigger value="modules">Módulos ({moduleCertificates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredCertificates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No se encontraron certificados</h3>
                  <p className="text-muted-foreground">
                    Completa algunos cursos o módulos para obtener certificados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={handleDownloadCertificate}
                    onView={handleViewCertificate}
                    onShare={handleShareCertificate}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            {courseCertificates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay certificados de curso</h3>
                  <p className="text-muted-foreground">
                    Completa algunos cursos para obtener certificados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={handleDownloadCertificate}
                    onView={handleViewCertificate}
                    onShare={handleShareCertificate}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            {moduleCertificates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay certificados de módulo</h3>
                  <p className="text-muted-foreground">
                    Completa algunos módulos para obtener certificados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moduleCertificates.map((certificate) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    onDownload={handleDownloadCertificate}
                    onView={handleViewCertificate}
                    onShare={handleShareCertificate}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
