import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Use system fonts instead of external fonts to avoid DataView errors

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    padding: 40,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 12,
    color: '#8b5cf6',
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 25,
  },
  recipientInfo: {
    marginBottom: 25,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  recipientTitle: {
    fontSize: 10,
    color: '#8b5cf6',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 9,
    color: '#6b7280',
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 11,
    color: '#1f2937',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 15,
  },
  paragraph: {
    marginBottom: 15,
  },
  highlightBox: {
    backgroundColor: '#faf5ff',
    padding: 15,
    marginVertical: 15,
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  highlightText: {
    fontSize: 10,
    color: '#1f2937',
    fontWeight: 'bold',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  closing: {
    marginTop: 30,
    marginBottom: 20,
  },
  closingText: {
    fontSize: 11,
    color: '#1f2937',
    marginBottom: 40,
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

interface PresentationLetterTemplate3Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate3: React.FC<PresentationLetterTemplate3Props> = ({ profile, letterData }) => {
  const formatDate = () => {
    return new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.title}>
            {profile?.jobTitle || profile?.targetPosition || "Profesional"}
          </Text>
          <View>
            {profile?.email && <Text style={styles.contactInfo}>Email: {profile.email}</Text>}
            {profile?.phone && <Text style={styles.contactInfo}>Tel: {profile.phone}</Text>}
            {profile?.address && <Text style={styles.contactInfo}>Dir: {profile.address}</Text>}
          </View>
        </View>

        {/* Date */}
        <Text style={styles.date}>{formatDate()}</Text>

        {/* Recipient Info */}
        <View style={styles.recipientInfo}>
          <Text style={styles.recipientName}>
            {letterData?.recipientName || "Nombre del Reclutador"}
          </Text>
          <Text style={styles.recipientTitle}>
            {letterData?.recipientTitle || "Título del Reclutador"}
          </Text>
          <Text style={styles.companyName}>
            {letterData?.companyName || "Nombre de la Empresa"}
          </Text>
          <Text style={styles.companyAddress}>
            {letterData?.companyAddress || "Dirección de la Empresa"}
          </Text>
        </View>

        {/* Subject */}
        <Text style={styles.subject}>
          {letterData?.subject || "Carta de Presentación"}
        </Text>

        {/* Greeting */}
        <Text style={styles.greeting}>
          {letterData?.greeting || "Estimado/a Reclutador/a,"}
        </Text>

        {/* Content */}
        <View style={styles.paragraph}>
          <Text style={styles.content}>
            {letterData?.content || "Me dirijo a usted para expresar mi interés en formar parte de su equipo de trabajo. Con mi experiencia y habilidades, estoy seguro de que puedo contribuir significativamente a los objetivos de su organización."}
          </Text>
        </View>

        {/* Highlight Box */}
        <View style={styles.highlightBox}>
          <Text style={styles.highlightText}>
            "Mi compromiso con la excelencia y mi pasión por el crecimiento profesional me convierten en un candidato ideal para su equipo."
          </Text>
        </View>

        <View style={styles.paragraph}>
          <Text style={styles.content}>
            {letterData?.additionalContent || "Mi formación académica y experiencia profesional me han preparado para enfrentar los desafíos que presenta el mercado laboral actual. Estoy comprometido con el crecimiento profesional y el trabajo en equipo."}
          </Text>
        </View>

        <View style={styles.paragraph}>
          <Text style={styles.content}>
            {letterData?.closingContent || "Agradezco su tiempo y consideración. Quedo a la espera de una oportunidad para discutir cómo puedo contribuir al éxito de su organización."}
          </Text>
        </View>

        {/* Closing */}
        <View style={styles.closing}>
          <Text style={styles.closingText}>
            {letterData?.closing || "Atentamente,"}
          </Text>
          <Text style={styles.signature}>
            {profile?.firstName} {profile?.lastName}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Esta carta fue generada con el CV Builder de CEMSE
          </Text>
        </View>
      </Page>
    </Document>
  );
};