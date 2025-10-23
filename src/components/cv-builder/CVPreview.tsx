"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";

interface CVPreviewProps {
  profile: any;
  templateId: string;
  templateName: string;
  onGeneratePDF: (templateId: string) => void;
  isGenerating: boolean;
}

export function CVPreview({ profile, templateId, templateName, onGeneratePDF, isGenerating }: CVPreviewProps) {

  if (!profile) {
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
              <p className="text-muted-foreground">Cargando información del perfil...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCVContent = () => {
    switch (templateId) {
      case "classic":
        return <ClassicCVPreview profile={profile} />;
      case "modern":
        return <ModernCVPreview profile={profile} />;
      case "creative":
        return <CreativeCVPreview profile={profile} />;
      default:
        return <ModernCVPreview profile={profile} />;
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
            {renderCVContent()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Classic Template Preview (Template 2) - Matches PDF Template 2
function ClassicCVPreview({ profile }: { profile: any }) {
  return (
    <div className="p-10 bg-white text-gray-900" style={{ fontFamily: 'Times, serif', fontSize: '11px', lineHeight: '1.5' }}>
      {/* Header - Centered */}
      <div className="text-center mb-6 pb-5 border-b border-black">
        <h1 className="text-3xl font-bold text-black mb-2" style={{ fontSize: '28px', color: '#000000', letterSpacing: '1px' }}>
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="text-lg text-gray-700 mb-4 italic" style={{ fontSize: '16px', color: '#333333' }}>
          {profile.jobTitle || profile.targetPosition || "Profesional"}
        </p>
        <div className="text-xs text-gray-600" style={{ fontSize: '10px', color: '#666666', lineHeight: '1.4' }}>
          {profile.email && <span>Email: {profile.email}</span>}
          {profile.phone && <span className="mx-2">Tel: {profile.phone}</span>}
          {profile.address && <span>Dir: {profile.address}</span>}
        </div>
      </div>

      {/* Professional Summary */}
      {profile.professionalSummary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-black mb-3 pb-1 border-b border-black uppercase tracking-wide" style={{ fontSize: '14px', color: '#000000', letterSpacing: '0.5px' }}>
            Resumen Profesional
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed text-justify" style={{ fontSize: '11px', color: '#333333', lineHeight: '1.6' }}>
            {profile.professionalSummary}
          </p>
        </div>
      )}

      {/* Experience */}
      {profile.workExperience && profile.workExperience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-black mb-3 pb-1 border-b border-black uppercase tracking-wide" style={{ fontSize: '14px', color: '#000000', letterSpacing: '0.5px' }}>
            Experiencia Laboral
          </h2>
          <div className="space-y-4">
            {profile.workExperience.slice(0, 3).map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="mb-1">
                  <h3 className="font-bold text-black mb-1" style={{ fontSize: '12px', color: '#000000' }}>
                    {exp.position || exp.jobTitle}
                  </h3>
                  <p className="text-xs font-bold text-gray-700 mb-1" style={{ fontSize: '11px', color: '#333333' }}>
                    {exp.company || exp.employer}
                  </p>
                  <p className="text-xs text-gray-600 italic" style={{ fontSize: '10px', color: '#666666' }}>
                    {exp.duration || exp.period}
                  </p>
                </div>
                {exp.description && (
                  <p className="text-xs text-gray-700 leading-relaxed text-justify mt-1" style={{ fontSize: '10px', color: '#333333', lineHeight: '1.5' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.educationHistory && profile.educationHistory.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-black mb-3 pb-1 border-b border-black uppercase tracking-wide" style={{ fontSize: '14px', color: '#000000', letterSpacing: '0.5px' }}>
            Educación
          </h2>
          <div className="space-y-3">
            {profile.educationHistory.slice(0, 2).map((edu: any, index: number) => (
              <div key={index} className="mb-3">
                <h3 className="font-bold text-black mb-1" style={{ fontSize: '12px', color: '#000000' }}>
                  {edu.degree || edu.title}
                </h3>
                <p className="text-xs font-bold text-gray-700 mb-1" style={{ fontSize: '11px', color: '#333333' }}>
                  {edu.institution || edu.school}
                </p>
                <p className="text-xs text-gray-600 italic" style={{ fontSize: '10px', color: '#666666' }}>
                  {edu.year || edu.graduationYear}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-black mb-3 pb-1 border-b border-black uppercase tracking-wide" style={{ fontSize: '14px', color: '#000000', letterSpacing: '0.5px' }}>
            Habilidades
          </h2>
          <div className="space-y-1">
            {profile.skills.slice(0, 6).map((skill: any, index: number) => (
              <div key={index} className="text-xs text-gray-700" style={{ fontSize: '10px', color: '#333333' }}>
                • {typeof skill === 'string' ? skill : skill.name || skill.skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold text-black mb-3 pb-1 border-b border-black uppercase tracking-wide" style={{ fontSize: '14px', color: '#000000', letterSpacing: '0.5px' }}>
            Idiomas
          </h2>
          <div className="space-y-1">
            {profile.languages.slice(0, 3).map((lang: any, index: number) => (
              <div key={index} className="text-xs text-gray-700" style={{ fontSize: '10px', color: '#333333' }}>
                • {typeof lang === 'string' ? lang : lang.language || lang.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Template Preview (Template 1) - Matches PDF Template 1
function ModernCVPreview({ profile }: { profile: any }) {
  return (
    <div className="p-8 bg-white text-gray-900" style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '10px', lineHeight: '1.4' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-5 pb-4 border-b-2 border-blue-600">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-800 mb-1" style={{ fontSize: '24px', color: '#1e40af' }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-sm text-gray-600 mb-2" style={{ fontSize: '14px', color: '#64748b' }}>
            {profile.jobTitle || profile.targetPosition || "Profesional"}
          </p>
          <div className="text-xs text-gray-600" style={{ fontSize: '9px', color: '#64748b', lineHeight: '1.3' }}>
            {profile.email && <div>Email: {profile.email}</div>}
            {profile.phone && <div>Tel: {profile.phone}</div>}
            {profile.address && <div>Dir: {profile.address}</div>}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {profile.professionalSummary && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2 pb-1 border-b border-gray-200" style={{ fontSize: '12px', color: '#1e40af' }}>
            Resumen Profesional
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed" style={{ fontSize: '10px', color: '#374151', lineHeight: '1.5' }}>
            {profile.professionalSummary}
          </p>
        </div>
      )}

      {/* Experience */}
      {profile.workExperience && profile.workExperience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2 pb-1 border-b border-gray-200" style={{ fontSize: '12px', color: '#1e40af' }}>
            Experiencia Laboral
          </h2>
          <div className="space-y-3">
            {profile.workExperience.slice(0, 3).map((exp: any, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900" style={{ fontSize: '11px', color: '#1f2937' }}>
                    {exp.position || exp.jobTitle}
                  </h3>
                  <span className="text-xs text-gray-500" style={{ fontSize: '9px', color: '#6b7280' }}>
                    {exp.duration || exp.period}
                  </span>
                </div>
                <p className="text-xs font-bold text-blue-600 mb-1" style={{ fontSize: '10px', color: '#2563eb' }}>
                  {exp.company || exp.employer}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-700 leading-relaxed" style={{ fontSize: '9px', color: '#374151', lineHeight: '1.4' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.educationHistory && profile.educationHistory.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2 pb-1 border-b border-gray-200" style={{ fontSize: '12px', color: '#1e40af' }}>
            Educación
          </h2>
          <div className="space-y-2">
            {profile.educationHistory.slice(0, 2).map((edu: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-gray-900" style={{ fontSize: '11px', color: '#1f2937' }}>
                    {edu.degree || edu.title}
                  </h3>
                  <span className="text-xs text-gray-500" style={{ fontSize: '9px', color: '#6b7280' }}>
                    {edu.year || edu.graduationYear}
                  </span>
                </div>
                <p className="text-xs font-bold text-blue-600" style={{ fontSize: '10px', color: '#2563eb' }}>
                  {edu.institution || edu.school}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills && profile.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2 pb-1 border-b border-gray-200" style={{ fontSize: '12px', color: '#1e40af' }}>
            Habilidades
          </h2>
          <div className="space-y-1">
            {profile.skills.slice(0, 6).map((skill: any, index: number) => (
              <div key={index} className="text-xs text-gray-700" style={{ fontSize: '9px', color: '#374151' }}>
                • {typeof skill === 'string' ? skill : skill.name || skill.skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {profile.languages && profile.languages.length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-bold text-blue-800 mb-2 pb-1 border-b border-gray-200" style={{ fontSize: '12px', color: '#1e40af' }}>
            Idiomas
          </h2>
          <div className="space-y-1">
            {profile.languages.slice(0, 3).map((lang: any, index: number) => (
              <div key={index} className="text-xs text-gray-700" style={{ fontSize: '9px', color: '#374151' }}>
                • {typeof lang === 'string' ? lang : lang.language || lang.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Creative Template Preview (Template 3) - Matches PDF Template 3
function CreativeCVPreview({ profile }: { profile: any }) {
  return (
    <div className="flex bg-white text-gray-900" style={{ fontFamily: 'Helvetica, sans-serif', fontSize: '9px', lineHeight: '1.4' }}>
      {/* Sidebar */}
      <div className="w-1/3 bg-green-600 text-white p-6" style={{ width: '35%', backgroundColor: '#10b981', padding: '25px' }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1" style={{ fontSize: '22px', color: '#FFFFFF', lineHeight: '1.2' }}>
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="text-xs font-bold text-green-100 mb-4" style={{ fontSize: '12px', color: '#d1fae5' }}>
            {profile.jobTitle || profile.targetPosition || "Profesional"}
          </p>
          <div className="text-xs text-green-100" style={{ fontSize: '8px', color: '#d1fae5', lineHeight: '1.3' }}>
            {profile.email && <div>Email: {profile.email}</div>}
            {profile.phone && <div>Tel: {profile.phone}</div>}
            {profile.address && <div>Dir: {profile.address}</div>}
          </div>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-white mb-3 pb-1 border-b border-green-400 uppercase tracking-wide" style={{ fontSize: '11px', color: '#FFFFFF', letterSpacing: '0.5px' }}>
              Habilidades
            </h2>
            <div className="space-y-2">
              {profile.skills.slice(0, 6).map((skill: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="text-xs font-bold text-white mb-1" style={{ fontSize: '9px', color: '#FFFFFF' }}>
                    {typeof skill === 'string' ? skill : skill.name || skill.skill}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-white mb-3 pb-1 border-b border-green-400 uppercase tracking-wide" style={{ fontSize: '11px', color: '#FFFFFF', letterSpacing: '0.5px' }}>
              Idiomas
            </h2>
            <div className="space-y-2">
              {profile.languages.slice(0, 3).map((lang: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="text-xs font-bold text-white mb-1" style={{ fontSize: '9px', color: '#FFFFFF' }}>
                    {typeof lang === 'string' ? lang : lang.language || lang.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6" style={{ width: '65%', padding: '25px' }}>
        {/* Professional Summary */}
        {profile.professionalSummary && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300" style={{ fontSize: '12px', color: '#1f2937' }}>
              Resumen Profesional
            </h2>
            <p className="text-xs text-gray-700 leading-relaxed" style={{ fontSize: '9px', color: '#374151', lineHeight: '1.5' }}>
              {profile.professionalSummary}
            </p>
          </div>
        )}

        {/* Experience */}
        {profile.workExperience && profile.workExperience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300" style={{ fontSize: '12px', color: '#1f2937' }}>
              Experiencia Laboral
            </h2>
            <div className="space-y-3">
              {profile.workExperience.slice(0, 3).map((exp: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900" style={{ fontSize: '10px', color: '#1f2937' }}>
                      {exp.position || exp.jobTitle}
                    </h3>
                    <span className="text-xs text-gray-500" style={{ fontSize: '8px', color: '#6b7280' }}>
                      {exp.duration || exp.period}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-700 mb-1" style={{ fontSize: '9px', color: '#374151' }}>
                    {exp.company || exp.employer}
                  </p>
                  {exp.description && (
                    <p className="text-xs text-gray-600 leading-relaxed" style={{ fontSize: '8px', color: '#6b7280', lineHeight: '1.4' }}>
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {profile.educationHistory && profile.educationHistory.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3 pb-1 border-b border-gray-300" style={{ fontSize: '12px', color: '#1f2937' }}>
              Educación
            </h2>
            <div className="space-y-2">
              {profile.educationHistory.slice(0, 2).map((edu: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900" style={{ fontSize: '10px', color: '#1f2937' }}>
                      {edu.degree || edu.title}
                    </h3>
                    <span className="text-xs text-gray-500" style={{ fontSize: '8px', color: '#6b7280' }}>
                      {edu.year || edu.graduationYear}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-700" style={{ fontSize: '9px', color: '#374151' }}>
                    {edu.institution || edu.school}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
