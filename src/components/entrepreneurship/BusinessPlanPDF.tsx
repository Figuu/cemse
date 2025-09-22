import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { BusinessPlanData } from '@/lib/businessPlanService';

// Register fonts if needed
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
    padding: 30,
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  text: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  boldText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1F2937',
    marginBottom: 5,
  },
  listItem: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
    marginLeft: 10,
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    fontWeight: 600,
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    flex: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    marginRight: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1F2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6B7280',
  },
});

interface BusinessPlanPDFProps {
  businessPlan: BusinessPlanData;
}

const BusinessPlanPDF: React.FC<BusinessPlanPDFProps> = ({ businessPlan }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'BOB',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{businessPlan.title || 'Plan de Negocio'}</Text>
          <Text style={styles.subtitle}>
            {businessPlan.industry && `Industria: ${businessPlan.industry}`}
            {businessPlan.stage && ` • Etapa: ${businessPlan.stage}`}
          </Text>
          <Text style={styles.subtitle}>
            Generado el {formatDate(new Date())}
          </Text>
        </View>

        {/* Executive Summary */}
        {businessPlan.executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
            <Text style={styles.text}>{businessPlan.executiveSummary}</Text>
          </View>
        )}

        {/* Business Description */}
        {businessPlan.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción del Negocio</Text>
            <Text style={styles.text}>{businessPlan.description}</Text>
          </View>
        )}

        {/* Problem & Solution */}
        {(businessPlan.problemStatement || businessPlan.solution) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Problema y Solución</Text>
            {businessPlan.problemStatement && (
              <>
                <Text style={styles.boldText}>Problema:</Text>
                <Text style={styles.text}>{businessPlan.problemStatement}</Text>
              </>
            )}
            {businessPlan.solution && (
              <>
                <Text style={styles.boldText}>Solución:</Text>
                <Text style={styles.text}>{businessPlan.solution}</Text>
              </>
            )}
          </View>
        )}

        {/* Value Proposition */}
        {businessPlan.valueProposition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propuesta de Valor</Text>
            <Text style={styles.text}>{businessPlan.valueProposition}</Text>
          </View>
        )}

        {/* Market Analysis */}
        {(businessPlan.targetMarket || businessPlan.marketSize) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análisis de Mercado</Text>
            {businessPlan.targetMarket && (
              <>
                <Text style={styles.boldText}>Mercado Objetivo:</Text>
                <Text style={styles.text}>{businessPlan.targetMarket}</Text>
              </>
            )}
            {businessPlan.marketSize > 0 && (
              <>
                <Text style={styles.boldText}>Tamaño del Mercado:</Text>
                <Text style={styles.text}>{formatCurrency(businessPlan.marketSize)}</Text>
              </>
            )}
          </View>
        )}

        {/* Business Model */}
        {businessPlan.businessModel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Modelo de Negocio</Text>
            <Text style={styles.text}>{businessPlan.businessModel}</Text>
          </View>
        )}

        {/* Revenue Streams */}
        {businessPlan.revenueStreams && businessPlan.revenueStreams.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fuentes de Ingresos</Text>
            {businessPlan.revenueStreams.map((stream, index) => (
              <Text key={index} style={styles.listItem}>• {stream}</Text>
            ))}
          </View>
        )}

        {/* Cost Structure */}
        {businessPlan.costStructure && businessPlan.costStructure.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estructura de Costos</Text>
            {businessPlan.costStructure.map((cost, index) => (
              <Text key={index} style={styles.listItem}>• {cost}</Text>
            ))}
          </View>
        )}

        {/* Financial Information */}
        {(businessPlan.fundingGoal > 0 || businessPlan.currentFunding > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Financiera</Text>
            <View style={styles.metricsContainer}>
              {businessPlan.fundingGoal > 0 && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Meta de Financiamiento</Text>
                  <Text style={styles.metricValue}>{formatCurrency(businessPlan.fundingGoal)}</Text>
                </View>
              )}
              {businessPlan.currentFunding > 0 && (
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Financiamiento Actual</Text>
                  <Text style={styles.metricValue}>{formatCurrency(businessPlan.currentFunding)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Team */}
        {businessPlan.team && businessPlan.team.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipo</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={styles.tableCell}>Nombre</Text>
                <Text style={styles.tableCell}>Rol</Text>
                <Text style={styles.tableCell}>Experiencia</Text>
                <Text style={styles.tableCell}>Equity (%)</Text>
              </View>
              {businessPlan.team.map((member, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{member.name}</Text>
                  <Text style={styles.tableCell}>{member.role}</Text>
                  <Text style={styles.tableCell}>{member.experience}</Text>
                  <Text style={styles.tableCell}>{member.equity}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Marketing Strategy */}
        {businessPlan.marketingStrategy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estrategia de Marketing</Text>
            <Text style={styles.text}>{businessPlan.marketingStrategy}</Text>
          </View>
        )}

        {/* Operations Plan */}
        {businessPlan.operationsPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan de Operaciones</Text>
            <Text style={styles.text}>{businessPlan.operationsPlan}</Text>
          </View>
        )}

        {/* Risk Analysis */}
        {businessPlan.riskAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análisis de Riesgos</Text>
            <Text style={styles.text}>{businessPlan.riskAnalysis}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Plan de Negocio generado automáticamente • {businessPlan.title || 'Plan de Negocio'}
        </Text>
      </Page>
    </Document>
  );
};

export default BusinessPlanPDF;
