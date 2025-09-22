"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BusinessPlanData } from '@/lib/businessPlanService';

interface PDFExportButtonProps {
  businessPlan: BusinessPlanData;
  className?: string;
}

const PDFExportButton: React.FC<PDFExportButtonProps> = ({ businessPlan, className }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Dynamic import to avoid SSR issues
      const { pdf } = await import('@react-pdf/renderer');
      const BusinessPlanPDF = (await import('./BusinessPlanPDF')).default;
      
      // Create the PDF document
      const doc = <BusinessPlanPDF businessPlan={businessPlan} />;
      
      // Generate the PDF blob
      const blob = await pdf(doc).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${businessPlan.title || 'Plan de Negocio'}.pdf`;
      
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

  return (
    <Button 
      variant="outline" 
      onClick={handleExportPDF}
      disabled={isExporting}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exportando...' : 'Exportar PDF'}
    </Button>
  );
};

export default PDFExportButton;
