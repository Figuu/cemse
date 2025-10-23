import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Use system fonts instead of external fonts to avoid DataView errors

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
    paddingBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#10b981',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 8,
    color: '#6b7280',
    lineHeight: 1.3,
    textAlign: 'right',
    marginBottom: 4,
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 25,
    textAlign: 'right',
  },
  recipientInfo: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  recipientTitle: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  companyName: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subject: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 25,
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  greeting: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 18,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 18,
  },
  paragraph: {
    marginBottom: 18,
  },
  closing: {
    marginTop: 35,
    marginBottom: 15,
  },
  closingText: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 50,
  },
  signature: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});

interface PresentationLetterTemplate2Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate2: React.FC<PresentationLetterTemplate2Props> = ({ profile, letterData }) => {
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
          <View style={styles.headerLeft}>
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.title}>
              {profile?.jobTitle || profile?.targetPosition || "Profesional"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View>
              {profile?.email && <Text style={styles.contactInfo}>Email: {profile.email}</Text>}
              {profile?.phone && <Text style={styles.contactInfo}>Tel: {profile.phone}</Text>}
              {profile?.address && <Text style={styles.contactInfo}>Dir: {profile.address}</Text>}
            </View>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
        </View>

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
          <Text style={styles.contactInfo}>
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
      </Page>
    </Document>
  );
};