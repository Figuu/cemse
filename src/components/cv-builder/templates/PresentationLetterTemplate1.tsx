import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for professional style
Font.register({
  family: 'Times-Roman',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/timesroman/v1/times-roman.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/timesroman/v1/times-roman-bold.woff2',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 35,
  },
  date: {
    fontSize: 10,
    color: '#333333',
    textAlign: 'right',
    marginBottom: 25,
  },
  recipientInfo: {
    marginBottom: 25,
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  recipientTitle: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  companyName: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 3,
  },
  address: {
    fontSize: 10,
    color: '#333333',
  },
  subject: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 11,
    color: '#000000',
    marginBottom: 18,
  },
  content: {
    fontSize: 11,
    color: '#333333',
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
    fontSize: 11,
    color: '#000000',
    marginBottom: 50,
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
});

interface PresentationLetterTemplate1Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate1: React.FC<PresentationLetterTemplate1Props> = ({ profile, letterData }) => {
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
        {/* Date */}
        <View style={styles.header}>
          <Text style={styles.date}>{formatDate()}</Text>
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
          <Text style={styles.address}>
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