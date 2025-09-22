import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { BusinessPlanData } from '@/lib/businessPlanService';

// Use default fonts to avoid CSP issues
// Font.register({
//   family: 'Roboto',
//   fonts: [
//     {
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
//       fontWeight: 300,
//     },
//     {
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
//       fontWeight: 400,
//     },
//     {
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
//       fontWeight: 500,
//     },
//     {
//       src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
//       fontWeight: 700,
//     },
//   ],
// });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  header: {
    backgroundColor: '#1E40AF',
    padding: 30,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginBottom: 0,
  },
  companyInfo: {
    alignItems: 'flex-end',
  },
  companyName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dateInfo: {
    fontSize: 12,
    color: '#E0E7FF',
  },
  canvasContainer: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  canvasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  canvasBlock: {
    width: '31%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 12,
    minHeight: 140,
    backgroundColor: '#FFFFFF',
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1E293B',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blockContent: {
    fontSize: 10,
    color: '#475569',
    lineHeight: 1.5,
  },
  valuePropositionBlock: {
    width: '31%',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 8,
    padding: 15,
    minHeight: 160,
    backgroundColor: '#EFF6FF',
  },
  valuePropositionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1E40AF',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valuePropositionContent: {
    fontSize: 10,
    color: '#1E40AF',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  summary: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '30%',
    backgroundColor: '#334155',
    padding: 12,
    borderRadius: 6,
  },
  summaryItemTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#3B82F6',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryItemContent: {
    fontSize: 10,
    color: '#E2E8F0',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 4,
  },
  emptyState: {
    fontSize: 9,
    color: '#94A3B8',
    fontStyle: 'italic',
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
    isValueProposition?: boolean;
  }> = ({ title, content, isValueProposition = false }) => {
    const blockStyle = isValueProposition ? styles.valuePropositionBlock : styles.canvasBlock;
    const titleStyle = isValueProposition ? styles.valuePropositionTitle : styles.blockTitle;
    const contentStyle = isValueProposition ? styles.valuePropositionContent : styles.blockContent;
    
    return (
      <View style={blockStyle}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={contentStyle}>
          {content || <Text style={styles.emptyState}>No especificado</Text>}
        </Text>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.title}>Business Model Canvas</Text>
              <Text style={styles.subtitle}>
                Modelo de Negocio Estratégico
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {businessPlan?.title || 'Mi Empresa'}
              </Text>
              <Text style={styles.dateInfo}>
                Generado el {formatDate(new Date())}
              </Text>
            </View>
          </View>
        </View>

        {/* Canvas Container */}
        <View style={styles.canvasContainer}>
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
              isValueProposition={true}
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
            <Text style={styles.summaryTitle}>Resumen Ejecutivo del Modelo de Negocio</Text>
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
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Business Model Canvas generado automáticamente • {businessPlan?.title || 'Business Model Canvas'} • {formatDate(new Date())}
        </Text>
      </Page>
    </Document>
  );
};

export default BusinessModelCanvasPDF;
