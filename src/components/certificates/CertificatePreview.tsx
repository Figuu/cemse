"use client";

import { Certificate } from "@/hooks/useCertificates";

interface CertificatePreviewProps {
  certificate: Certificate;
}

export function CertificatePreview({ certificate }: CertificatePreviewProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative bg-white p-8 sm:p-10 rounded-lg shadow-lg w-full" style={{ minHeight: '700px' }}>
      {/* Decorative border - matching PDF */}
      <div className="absolute inset-5 border-2 border-[#47b4d8] rounded-lg"></div>
      <div className="absolute top-12 left-12 right-12 h-0.5 bg-[#47b4d8] opacity-30"></div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col py-4">
        {/* Header with Logos */}
        <div className="text-center mb-6">
          {/* Logos row - matching PDF layout */}
          <div className="flex items-center justify-center gap-2 mb-4 min-h-[70px]">
            <img
              src="/logos/cemse.png"
              alt="CEMSE"
              className="h-[60px] object-contain"
            />
            <img
              src="/logos/kallpa.png"
              alt="Kallpa"
              className="h-[70px] object-contain"
            />
            <img
              src="/logos/manqa.png"
              alt="Manqa"
              className="h-[60px] object-contain"
            />
            <img
              src="/logos/childfund.png"
              alt="ChildFund"
              className="h-[30px] object-contain"
            />
            <img
              src="/logos/stc.png"
              alt="STC"
              className="h-[55px] object-contain"
            />
            <img
              src="/logos/40.png"
              alt="40 Años"
              className="h-[60px] object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#47b4d8] mb-2">
            CERTIFICADO DE COMPLETACIÓN
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Emplea Emprende - Centro de Emprendimiento y Desarrollo Sostenible
          </p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-5 px-4">
          <p className="text-base sm:text-lg text-gray-800">Se certifica que</p>

          <h2 className="text-xl sm:text-2xl font-bold text-[#47b4d8] px-4" style={{ textDecoration: 'underline', textDecorationColor: '#47b4d8' }}>
            {certificate.student.name}
          </h2>

          <p className="text-base sm:text-lg text-gray-800">ha completado exitosamente el curso</p>

          <h3 className="text-lg sm:text-xl font-bold text-[#47b4d8] px-8">
            "{certificate.course.title}"
          </h3>

          {certificate.type === "module" && certificate.module && (
            <p className="text-base text-gray-700">
              Módulo: {certificate.module.title}
            </p>
          )}

          <p className="text-sm text-gray-600 pt-2">
            Completado el {formatDate(certificate.issuedAt)}
          </p>
        </div>

        {/* Signature Section */}
        <div className="flex justify-between items-end mt-12 pt-8 px-4 sm:px-8 border-t border-gray-200">
          <div className="text-center flex-1">
            <div className="w-full h-px bg-black mb-2 mx-auto max-w-[180px]"></div>
            <p className="text-xs text-gray-600">Instructor del Curso</p>
            <p className="text-xs font-bold mt-1">
              {certificate.course.instructor?.name || 'Instructor'}
            </p>
          </div>

          <div className="text-center flex-1">
            <div className="w-full h-px bg-black mb-2 mx-auto max-w-[180px]"></div>
            <p className="text-xs text-gray-600">Director Académico</p>
            <p className="text-xs font-bold mt-1">Emplea Emprende</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-gray-400 px-4">
          <p>
            Este certificado es válido y puede ser verificado en el sistema de gestión académica de Emplea Emprende.
          </p>
          <p className="mt-1">
            Certificado generado digitalmente • ID: {certificate.id.slice(0, 12).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
