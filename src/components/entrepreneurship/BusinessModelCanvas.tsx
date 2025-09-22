"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Activity, 
  Heart, 
  Target, 
  Building, 
  Key, 
  Share2, 
  DollarSign,
  Download,
  Save
} from 'lucide-react';
import { BusinessPlanData } from '@/lib/businessPlanService';

interface BusinessModelCanvasProps {
  businessPlan?: BusinessPlanData;
  onSave?: (canvasData: any) => void;
}

interface CanvasData {
  keyPartners: string;
  keyActivities: string;
  valuePropositions: string;
  customerRelationships: string;
  customerSegments: string;
  keyResources: string;
  channels: string;
  costStructure: string;
  revenueStreams: string;
}

const BusinessModelCanvas: React.FC<BusinessModelCanvasProps> = ({ 
  businessPlan, 
  onSave 
}) => {
  
  // Initialize with empty data first
  const [canvasData, setCanvasData] = useState<CanvasData>({
    keyPartners: '',
    keyActivities: '',
    valuePropositions: '',
    customerRelationships: '',
    customerSegments: '',
    keyResources: '',
    channels: '',
    costStructure: '',
    revenueStreams: '',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Auto-populate from business plan data if available (only once on mount)
  useEffect(() => {
    if (businessPlan && !isInitialized) {
      setCanvasData({
        keyPartners: businessPlan.businessModelCanvas?.keyPartners || '',
        keyActivities: businessPlan.businessModelCanvas?.keyActivities || '',
        valuePropositions: businessPlan.valueProposition || businessPlan.businessModelCanvas?.valuePropositions || '',
        customerRelationships: businessPlan.businessModelCanvas?.customerRelationships || '',
        customerSegments: businessPlan.targetMarket || businessPlan.businessModelCanvas?.customerSegments || '',
        keyResources: businessPlan.businessModelCanvas?.keyResources || '',
        channels: businessPlan.marketingStrategy || businessPlan.businessModelCanvas?.channels || '',
        costStructure: businessPlan.costStructure?.join(', ') || businessPlan.businessModelCanvas?.costStructure || '',
        revenueStreams: businessPlan.revenueStreams?.join(', ') || businessPlan.businessModelCanvas?.revenueStreams || '',
      });
      setIsInitialized(true);
    }
  }, [businessPlan?.id, isInitialized]); // Only depend on businessPlan.id to prevent unnecessary re-renders

  const handleInputChange = useCallback((field: keyof CanvasData, value: string) => {
    setCanvasData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = () => {
    onSave?.(canvasData);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const BusinessModelCanvasPDF = (await import('./BusinessModelCanvasPDF')).default;
      
      // Create the PDF document
      const doc = <BusinessModelCanvasPDF canvasData={canvasData} businessPlan={businessPlan} />;
      
      // Generate the PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessPlan?.title || 'Business Model Canvas'}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const CanvasBlock: React.FC<{
    title: string;
    icon: React.ReactNode;
    field: keyof CanvasData;
    placeholder: string;
    className?: string;
  }> = ({ title, icon, field, placeholder, className = "" }) => (
    <Card className={`h-full ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          value={canvasData[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] resize-none text-xs"
        />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Model Canvas</h2>
          <p className="text-muted-foreground">
            Diseña y visualiza tu modelo de negocio en 9 bloques clave
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button onClick={handleExportPDF} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-6xl mx-auto">
        {/* Top Row */}
        <div className="col-span-1">
          <CanvasBlock
            title="Socios Clave"
            icon={<Users className="h-4 w-4" />}
            field="keyPartners"
            placeholder="¿Quiénes son tus socios clave? ¿Qué recursos clave obtienes de ellos?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Actividades Clave"
            icon={<Activity className="h-4 w-4" />}
            field="keyActivities"
            placeholder="¿Qué actividades clave requiere tu propuesta de valor?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Propuesta de Valor"
            icon={<Heart className="h-4 w-4" />}
            field="valuePropositions"
            placeholder="¿Qué valor entregas al cliente? ¿Qué problema resuelves?"
          />
        </div>

        {/* Middle Row */}
        <div className="col-span-1">
          <CanvasBlock
            title="Relaciones con Clientes"
            icon={<Target className="h-4 w-4" />}
            field="customerRelationships"
            placeholder="¿Qué tipo de relación esperan los clientes?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Segmentos de Clientes"
            icon={<Building className="h-4 w-4" />}
            field="customerSegments"
            placeholder="¿Para quién estás creando valor? ¿Quiénes son tus clientes?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Canales"
            icon={<Share2 className="h-4 w-4" />}
            field="channels"
            placeholder="¿Cómo llegas a tus clientes? ¿Cómo les entregas la propuesta de valor?"
          />
        </div>

        {/* Bottom Row */}
        <div className="col-span-1">
          <CanvasBlock
            title="Recursos Clave"
            icon={<Key className="h-4 w-4" />}
            field="keyResources"
            placeholder="¿Qué recursos clave requiere tu modelo de negocio?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Estructura de Costos"
            icon={<DollarSign className="h-4 w-4" />}
            field="costStructure"
            placeholder="¿Cuáles son los costos más importantes en tu modelo de negocio?"
          />
        </div>
        
        <div className="col-span-1">
          <CanvasBlock
            title="Fuentes de Ingresos"
            icon={<DollarSign className="h-4 w-4" />}
            field="revenueStreams"
            placeholder="¿Por qué valor están dispuestos a pagar los clientes?"
          />
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Modelo de Negocio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Propuesta de Valor</h4>
              <p className="text-muted-foreground">
                {canvasData.valuePropositions || 'No especificado'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Segmento de Clientes</h4>
              <p className="text-muted-foreground">
                {canvasData.customerSegments || 'No especificado'}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Fuentes de Ingresos</h4>
              <p className="text-muted-foreground">
                {canvasData.revenueStreams || 'No especificado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessModelCanvas;