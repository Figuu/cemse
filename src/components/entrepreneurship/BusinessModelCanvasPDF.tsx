import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { BusinessPlanData } from '@/lib/businessPlanService';

// Register fonts
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Roboto',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
  },
  canvasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  canvasBlock: {
    width: '30%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    padding: 10,
    minHeight: 120,
  },
  blockTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  blockContent: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '30%',
  },
  summaryItemTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: 5,
  },
  summaryItemContent: {
    fontSize: 9,
    color: '#6B7280',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
  },
});

interface BusinessModelCanvasPDFProps {
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
  businessPlan?: BusinessPlanData;
}

const BusinessModelCanvasPDF: React.FC<BusinessModelCanvasPDFProps> = ({ 
  canvasData, 
  businessPlan 
}) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const CanvasBlock: React.FC<{
    title: string;
    content: string;
  }> = ({ title, content }) => (
    <View style={styles.canvasBlock}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockContent}>
        {content || 'No especificado'}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Business Model Canvas</Text>
          <Text style={styles.subtitle}>
            {businessPlan?.title && `${businessPlan.title} • `}
            Generado el {formatDate(new Date())}
          </Text>
        </View>

        {/* Canvas Grid */}
        <View style={styles.canvasGrid}>
          <CanvasBlock
            title="Socios Clave"
            content={canvasData.keyPartners}
          />
          <CanvasBlock
            title="Actividades Clave"
            content={canvasData.keyActivities}
          />
          <CanvasBlock
            title="Propuesta de Valor"
            content={canvasData.valuePropositions}
          />
          <CanvasBlock
            title="Relaciones con Clientes"
            content={canvasData.customerRelationships}
          />
          <CanvasBlock
            title="Segmentos de Clientes"
            content={canvasData.customerSegments}
          />
          <CanvasBlock
            title="Canales"
            content={canvasData.channels}
          />
          <CanvasBlock
            title="Recursos Clave"
            content={canvasData.keyResources}
          />
          <CanvasBlock
            title="Estructura de Costos"
            content={canvasData.costStructure}
          />
          <CanvasBlock
            title="Fuentes de Ingresos"
            content={canvasData.revenueStreams}
          />
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Resumen del Modelo de Negocio</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemTitle}>Propuesta de Valor</Text>
              <Text style={styles.summaryItemContent}>
                {canvasData.valuePropositions || 'No especificado'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemTitle}>Segmento de Clientes</Text>
              <Text style={styles.summaryItemContent}>
                {canvasData.customerSegments || 'No especificado'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemTitle}>Fuentes de Ingresos</Text>
              <Text style={styles.summaryItemContent}>
                {canvasData.revenueStreams || 'No especificado'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Business Model Canvas generado automáticamente • {businessPlan?.title || 'Business Model Canvas'}
        </Text>
      </Page>
    </Document>
  );
};

export default BusinessModelCanvasPDF;
