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
    padding: 60,
    fontFamily: 'Times-Roman',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
  },
  date: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'right',
    marginBottom: 20,
  },
  recipientInfo: {
    marginBottom: 20,
  },
  recipientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  recipientTitle: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 2,
  },
  address: {
    fontSize: 11,
    color: '#333333',
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  greeting: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 15,
  },
  content: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 15,
  },
  paragraph: {
    marginBottom: 15,
  },
  closing: {
    marginTop: 30,
    marginBottom: 10,
  },
  closingText: {
    fontSize: 12,
    color: '#000000',
    marginBottom: 40,
  },
  signature: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 60,
    right: 60,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
  },
});

interface PresentationLetterTemplate1Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate1: React.FC<PresentationLetterTemplate1Props> = ({ 
  profile, 
  letterData 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDefaultContent = () => {
    if (letterData.content) return letterData.content;
    
    return `Estimado/a ${letterData.recipientName || 'Señor/Señora'}:

Me dirijo a usted con el propósito de expresar mi interés en la posición de ${letterData.position || '[Posición]'} en ${letterData.companyName || '[Empresa]'}.

Como ${profile?.jobTitle || 'profesional'} con ${profile?.experienceLevel ? 
      (profile.experienceLevel === 'NO_EXPERIENCE' ? 'motivación y ganas de aprender' :
       profile.experienceLevel === 'ENTRY_LEVEL' ? 'experiencia inicial' :
       profile.experienceLevel === 'MID_LEVEL' ? 'experiencia sólida' :
       'amplia experiencia') : 'experiencia relevante'}, estoy convencido/a de que puedo aportar valor a su organización.

${profile?.professionalSummary || 'Mi formación y experiencia me han preparado para enfrentar los desafíos de esta posición, y estoy comprometido/a con el crecimiento profesional y el éxito de la empresa.'}

Estaría encantado/a de tener la oportunidad de discutir cómo mis habilidades y experiencia pueden contribuir al éxito de ${letterData.companyName || 'su empresa'}. Agradezco su consideración y quedo a la espera de su respuesta.`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Date */}
        <Text style={styles.date}>
          {formatDate(letterData.date)}
        </Text>

        {/* Recipient Information */}
        <View style={styles.recipientInfo}>
          {letterData.recipientName && (
            <Text style={styles.recipientName}>
              {letterData.recipientName}
            </Text>
          )}
          {letterData.recipientTitle && (
            <Text style={styles.recipientTitle}>
              {letterData.recipientTitle}
            </Text>
          )}
          {letterData.companyName && (
            <Text style={styles.companyName}>
              {letterData.companyName}
            </Text>
          )}
          <Text style={styles.address}>
            {profile?.address || ''}
          </Text>
        </View>

        {/* Subject */}
        {letterData.subject && (
          <Text style={styles.subject}>
            Asunto: {letterData.subject}
          </Text>
        )}

        {/* Greeting */}
        <Text style={styles.greeting}>
          {letterData.recipientName ? 
            `Estimado/a ${letterData.recipientName}:` : 
            'Estimado/a Señor/Señora:'
          }
        </Text>

        {/* Content */}
        <View style={styles.content}>
          {getDefaultContent().split('\n\n').map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph}
            </Text>
          ))}
        </View>

        {/* Closing */}
        <View style={styles.closing}>
          <Text style={styles.closingText}>
            {letterData.closing || 'Atentamente,'}
          </Text>
          <Text style={styles.signature}>
            {letterData.signature || `${profile?.firstName} ${profile?.lastName}`}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {profile?.email} | {profile?.phone} | {profile?.city}, {profile?.state || profile?.country}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
