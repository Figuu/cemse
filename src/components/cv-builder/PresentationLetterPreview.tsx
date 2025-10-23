"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

interface PresentationLetterPreviewProps {
  profile: any;
  letterData: any;
  templateId: string;
  templateName: string;
  onGeneratePDF: (templateId: string) => void;
  isGenerating: boolean;
}

export function PresentationLetterPreview({ 
  profile, 
  letterData, 
  templateId, 
  templateName, 
  onGeneratePDF, 
  isGenerating 
}: PresentationLetterPreviewProps) {

  if (!profile || !letterData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Vista Previa - {templateName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-6 min-h-[400px] flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando información de la carta...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderLetterContent = () => {
    switch (templateId) {
      case "professional":
        return <ProfessionalLetterPreview profile={profile} letterData={letterData} />;
      case "modern":
        return <ModernLetterPreview profile={profile} letterData={letterData} />;
      case "creative":
        return <CreativeLetterPreview profile={profile} letterData={letterData} />;
      default:
        return <ProfessionalLetterPreview profile={profile} letterData={letterData} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Vista Previa - {templateName}
          </CardTitle>
          <Button
            onClick={() => onGeneratePDF(templateId)}
            disabled={isGenerating}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generando..." : "Descargar PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-auto">
            {renderLetterContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Professional Template Preview (Template 1) - Matches PDF Template 1
function ProfessionalLetterPreview({ profile, letterData }: { profile: any; letterData: any }) {
  return (
    <div className="p-16 bg-white text-gray-900" style={{ fontFamily: 'Times, serif', fontSize: '12px', lineHeight: '1.6' }}>
      {/* Date */}
      <div className="text-right mb-8" style={{ fontSize: '11px', color: '#333333' }}>
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>

      {/* Recipient Info */}
      <div className="mb-5">
        <div className="font-bold mb-1" style={{ fontSize: '12px', color: '#000000' }}>
          {letterData.recipientName || "Nombre del Reclutador"}
        </div>
        <div className="mb-1" style={{ fontSize: '11px', color: '#333333' }}>
          {letterData.recipientTitle || "Título del Reclutador"}
        </div>
        <div className="mb-1" style={{ fontSize: '11px', color: '#333333' }}>
          {letterData.companyName || "Nombre de la Empresa"}
        </div>
        <div style={{ fontSize: '11px', color: '#333333' }}>
          {letterData.companyAddress || "Dirección de la Empresa"}
        </div>
      </div>

      {/* Subject */}
      <div className="font-bold mb-5 uppercase" style={{ fontSize: '12px', color: '#000000' }}>
        {letterData.subject || "Carta de Presentación"}
      </div>

      {/* Greeting */}
      <div className="mb-4" style={{ fontSize: '12px', color: '#000000' }}>
        {letterData.greeting || "Estimado/a Reclutador/a,"}
      </div>

      {/* Content */}
      <div className="mb-4" style={{ fontSize: '12px', color: '#333333', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.content || "Me dirijo a usted para expresar mi interés en formar parte de su equipo de trabajo. Con mi experiencia y habilidades, estoy seguro de que puedo contribuir significativamente a los objetivos de su organización."}
      </div>

      <div className="mb-4" style={{ fontSize: '12px', color: '#333333', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.additionalContent || "Mi formación académica y experiencia profesional me han preparado para enfrentar los desafíos que presenta el mercado laboral actual. Estoy comprometido con el crecimiento profesional y el trabajo en equipo."}
      </div>

      <div className="mb-4" style={{ fontSize: '12px', color: '#333333', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.closingContent || "Agradezco su tiempo y consideración. Quedo a la espera de una oportunidad para discutir cómo puedo contribuir al éxito de su organización."}
      </div>

      {/* Closing */}
      <div className="mt-8 mb-3">
        <div className="mb-10" style={{ fontSize: '12px', color: '#000000' }}>
          {letterData.closing || "Atentamente,"}
        </div>
        <div className="font-bold" style={{ fontSize: '12px', color: '#000000' }}>
          {profile.firstName} {profile.lastName}
        </div>
      </div>
    </div>
  );
}

// Modern Template Preview (Template 2) - Matches PDF Template 2
function ModernLetterPreview({ profile, letterData }: { profile: any; letterData: any }) {
  return (
    <div className="p-12 bg-white text-gray-900" style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-5 border-b-4 border-green-500">
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900 mb-1" style={{ fontSize: '18px', color: '#1f2937' }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-xs font-bold text-green-600" style={{ fontSize: '12px', color: '#10b981' }}>
            {profile.jobTitle || profile.targetPosition || "Profesional"}
          </p>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-gray-500 mb-5" style={{ fontSize: '9px', color: '#6b7280', lineHeight: '1.3' }}>
            {profile.email && <div>Email: {profile.email}</div>}
            {profile.phone && <div>Tel: {profile.phone}</div>}
            {profile.address && <div>Dir: {profile.address}</div>}
          </div>
          <div className="text-xs text-gray-500" style={{ fontSize: '10px', color: '#6b7280' }}>
            {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Recipient Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded" style={{ backgroundColor: '#f9fafb', borderRadius: '5px' }}>
        <div className="font-bold mb-1" style={{ fontSize: '12px', color: '#1f2937' }}>
          {letterData.recipientName || "Nombre del Reclutador"}
        </div>
        <div className="text-xs font-bold text-green-600 mb-1" style={{ fontSize: '10px', color: '#10b981' }}>
          {letterData.recipientTitle || "Título del Reclutador"}
        </div>
        <div className="text-xs font-bold text-gray-700 mb-1" style={{ fontSize: '11px', color: '#374151' }}>
          {letterData.companyName || "Nombre de la Empresa"}
        </div>
        <div className="text-xs text-gray-600" style={{ fontSize: '10px', color: '#6b7280' }}>
          {letterData.companyAddress || "Dirección de la Empresa"}
        </div>
      </div>

      {/* Subject */}
      <div className="font-bold mb-5 p-3 bg-green-50 rounded border-l-4 border-green-500" style={{ fontSize: '12px', color: '#1f2937', backgroundColor: '#ecfdf5', borderRadius: '3px', borderLeftWidth: '4px', borderLeftColor: '#10b981' }}>
        {letterData.subject || "Carta de Presentación"}
      </div>

      {/* Greeting */}
      <div className="mb-4 font-bold" style={{ fontSize: '11px', color: '#1f2937' }}>
        {letterData.greeting || "Estimado/a Reclutador/a,"}
      </div>

      {/* Content */}
      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.content || "Me dirijo a usted para expresar mi interés en formar parte de su equipo de trabajo. Con mi experiencia y habilidades, estoy seguro de que puedo contribuir significativamente a los objetivos de su organización."}
      </div>

      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.additionalContent || "Mi formación académica y experiencia profesional me han preparado para enfrentar los desafíos que presenta el mercado laboral actual. Estoy comprometido con el crecimiento profesional y el trabajo en equipo."}
      </div>

      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.closingContent || "Agradezco su tiempo y consideración. Quedo a la espera de una oportunidad para discutir cómo puedo contribuir al éxito de su organización."}
      </div>

      {/* Closing */}
      <div className="mt-8 mb-3">
        <div className="mb-10" style={{ fontSize: '11px', color: '#1f2937' }}>
          {letterData.closing || "Atentamente,"}
        </div>
        <div className="font-bold" style={{ fontSize: '11px', color: '#1f2937' }}>
          {profile.firstName} {profile.lastName}
        </div>
      </div>
    </div>
  );
}

// Creative Template Preview (Template 3) - Matches PDF Template 3
function CreativeLetterPreview({ profile, letterData }: { profile: any; letterData: any }) {
  return (
    <div className="bg-white text-gray-900 p-10" style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '11px', lineHeight: '1.5' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontSize: '20px', color: '#1f2937' }}>
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-sm font-bold text-purple-600 mb-4" style={{ fontSize: '12px', color: '#8b5cf6' }}>
          {profile.jobTitle || profile.targetPosition || "Profesional"}
        </p>
        <div className="text-xs text-gray-500" style={{ fontSize: '9px', color: '#6b7280' }}>
          {profile.email && <div>Email: {profile.email}</div>}
          {profile.phone && <div>Tel: {profile.phone}</div>}
          {profile.address && <div>Dir: {profile.address}</div>}
        </div>
      </div>

      {/* Date */}
      <div className="text-right mb-6" style={{ fontSize: '10px', color: '#6b7280' }}>
        {new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>

      {/* Recipient Info */}
      <div className="mb-6">
        <div className="font-bold mb-1" style={{ fontSize: '11px', color: '#1f2937' }}>
          {letterData.recipientName || "Nombre del Reclutador"}
        </div>
        <div className="text-xs font-bold text-purple-600 mb-1" style={{ fontSize: '10px', color: '#8b5cf6' }}>
          {letterData.recipientTitle || "Título del Reclutador"}
        </div>
        <div className="text-xs font-bold text-gray-700 mb-1" style={{ fontSize: '10px', color: '#374151' }}>
          {letterData.companyName || "Nombre de la Empresa"}
        </div>
        <div className="text-xs text-gray-500" style={{ fontSize: '9px', color: '#6b7280' }}>
          {letterData.companyAddress || "Dirección de la Empresa"}
        </div>
      </div>

      {/* Subject */}
      <div className="text-center mb-5 p-3 bg-gray-50 rounded border" style={{ fontSize: '12px', color: '#1f2937', backgroundColor: '#f8fafc', borderRadius: '5px', borderWidth: '1px', borderColor: '#e2e8f0' }}>
        {letterData.subject || "Carta de Presentación"}
      </div>

      {/* Greeting */}
      <div className="mb-5 font-bold" style={{ fontSize: '11px', color: '#1f2937' }}>
        {letterData.greeting || "Estimado/a Reclutador/a,"}
      </div>

      {/* Content */}
      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.content || "Me dirijo a usted para expresar mi interés en formar parte de su equipo de trabajo. Con mi experiencia y habilidades, estoy seguro de que puedo contribuir significativamente a los objetivos de su organización."}
      </div>

      {/* Highlight Box */}
      <div className="my-4 p-4 bg-purple-50 rounded border-l-4 border-purple-600" style={{ backgroundColor: '#faf5ff', borderRadius: '5px', borderLeftWidth: '4px', borderLeftColor: '#8b5cf6' }}>
        <div className="text-center font-bold italic" style={{ fontSize: '10px', color: '#1f2937' }}>
          "Mi compromiso con la excelencia y mi pasión por el crecimiento profesional me convierten en un candidato ideal para su equipo."
        </div>
      </div>

      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.additionalContent || "Mi formación académica y experiencia profesional me han preparado para enfrentar los desafíos que presenta el mercado laboral actual. Estoy comprometido con el crecimiento profesional y el trabajo en equipo."}
      </div>

      <div className="mb-4" style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', textAlign: 'justify' }}>
        {letterData.closingContent || "Agradezco su tiempo y consideración. Quedo a la espera de una oportunidad para discutir cómo puedo contribuir al éxito de su organización."}
      </div>

      {/* Closing */}
      <div className="mt-8 mb-5">
        <div className="mb-10" style={{ fontSize: '11px', color: '#1f2937' }}>
          {letterData.closing || "Atentamente,"}
        </div>
        <div className="font-bold" style={{ fontSize: '11px', color: '#1f2937' }}>
          {profile.firstName} {profile.lastName}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
        <div className="text-xs text-gray-400 italic" style={{ fontSize: '8px', color: '#9ca3af' }}>
          Esta carta fue generada con el CV Builder de CEMSE
        </div>
      </div>
    </div>
  );
}
