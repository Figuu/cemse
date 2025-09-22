"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, Grid3X3 } from "lucide-react";

interface BusinessModelCanvasProps {
  canvasData: {
    keyPartners: string;
    keyActivities: string;
    valuePropositions: string;
    customerRelationships: string;
    customerSegments: string;
    keyResources: string;
    channels: string;
    costStructure: string;
    revenueStreams: string;
  };
  onExportPDF?: () => void;
  onView?: () => void;
  className?: string;
}

export function BusinessModelCanvas({ 
  canvasData, 
  onExportPDF, 
  onView,
  className 
}: BusinessModelCanvasProps) {
  const canvasSections = [
    {
      title: "Socios Clave",
      content: canvasData.keyPartners,
      color: "bg-blue-50 border-blue-200",
      icon: "🤝"
    },
    {
      title: "Actividades Clave",
      content: canvasData.keyActivities,
      color: "bg-green-50 border-green-200",
      icon: "⚙️"
    },
    {
      title: "Propuestas de Valor",
      content: canvasData.valuePropositions,
      color: "bg-purple-50 border-purple-200",
      icon: "💎"
    },
    {
      title: "Relaciones con Clientes",
      content: canvasData.customerRelationships,
      color: "bg-pink-50 border-pink-200",
      icon: "❤️"
    },
    {
      title: "Segmentos de Clientes",
      content: canvasData.customerSegments,
      color: "bg-orange-50 border-orange-200",
      icon: "👥"
    },
    {
      title: "Recursos Clave",
      content: canvasData.keyResources,
      color: "bg-yellow-50 border-yellow-200",
      icon: "🔑"
    },
    {
      title: "Canales",
      content: canvasData.channels,
      color: "bg-indigo-50 border-indigo-200",
      icon: "📢"
    },
    {
      title: "Estructura de Costos",
      content: canvasData.costStructure,
      color: "bg-red-50 border-red-200",
      icon: "💰"
    },
    {
      title: "Fuentes de Ingresos",
      content: canvasData.revenueStreams,
      color: "bg-emerald-50 border-emerald-200",
      icon: "💵"
    }
  ];

  const getCompletionPercentage = () => {
    const filledSections = canvasSections.filter(section => 
      section.content && section.content.trim().length > 0
    );
    return Math.round((filledSections.length / canvasSections.length) * 100);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Business Model Canvas
                <Badge variant="outline" className="ml-2">
                  {getCompletionPercentage()}% completado
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {onView && (
                <Button variant="outline" size="sm" onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Canvas
                </Button>
              )}
              {onExportPDF && (
                <Button variant="outline" size="sm" onClick={onExportPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Canvas Grid */}
          <div className="grid grid-cols-3 gap-2 max-w-6xl mx-auto">
            {/* Top Row - Partners, Activities, Value Props */}
            <div className="space-y-2">
              <div className={`p-3 rounded-lg border-2 ${canvasSections[0].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[0].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[0].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[0].content || "Define tus socios estratégicos..."}
                </p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${canvasSections[1].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[1].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[1].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[1].content || "Describe las actividades principales..."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg border-2 ${canvasSections[2].color} min-h-[240px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[2].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[2].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[2].content || "Define el valor único que ofreces..."}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className={`p-3 rounded-lg border-2 ${canvasSections[3].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[3].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[3].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[3].content || "Tipo de relación con clientes..."}
                </p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${canvasSections[4].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[4].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[4].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[4].content || "Segmentos de clientes objetivo..."}
                </p>
              </div>
            </div>

            {/* Middle Row - Resources, Channels */}
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-lg border-2 ${canvasSections[5].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[5].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[5].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[5].content || "Recursos necesarios para crear valor..."}
                </p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${canvasSections[6].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[6].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[6].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[6].content || "Cómo llegas a tus clientes..."}
                </p>
              </div>
            </div>

            {/* Bottom Row - Costs, Revenue */}
            <div className="col-span-3 grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-lg border-2 ${canvasSections[7].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[7].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[7].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[7].content || "Costos más importantes del negocio..."}
                </p>
              </div>
              <div className={`p-3 rounded-lg border-2 ${canvasSections[8].color} min-h-[120px]`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{canvasSections[8].icon}</span>
                  <h4 className="font-semibold text-sm">{canvasSections[8].title}</h4>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {canvasSections[8].content || "Cómo genera ingresos tu negocio..."}
                </p>
              </div>
            </div>
          </div>

          {/* Canvas Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Leyenda del Canvas</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded"></div>
                <span>Socios Clave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
                <span>Actividades Clave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-100 border border-purple-200 rounded"></div>
                <span>Propuestas de Valor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-100 border border-pink-200 rounded"></div>
                <span>Relaciones con Clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
                <span>Segmentos de Clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
                <span>Recursos Clave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-100 border border-indigo-200 rounded"></div>
                <span>Canales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
                <span>Estructura de Costos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div>
                <span>Fuentes de Ingresos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
