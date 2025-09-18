import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Use system fonts instead of external fonts to avoid DataView errors

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  title: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 9,
    color: '#6b7280',
    lineHeight: 1.3,
    textAlign: 'right',
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'right',
  },
  recipientInfo: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  recipientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  recipientTitle: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subject: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ecfdf5',
    borderRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  greeting: {
    fontSize: 11,
    color: '#1f2937',
    marginBottom: 15,
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
    marginBottom: 12,
  },
  highlight: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    marginBottom: 12,
  },
  closing: {
    marginTop: 25,
    marginBottom: 10,
  },
  closingText: {
    fontSize: 11,
    color: '#1f2937',
    marginBottom: 30,
  },
  signature: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface PresentationLetterTemplate2Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate2: React.FC<PresentationLetterTemplate2Props> = ({ 
  profile, 
  letterData 
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) {
      return new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    try {
      // Handle different date formats
      let date: Date;
      if (dateString.includes('/')) {
        // Handle DD/MM/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          date = new Date(dateString);
        }
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      // Fallback to current date if parsing fails
      return new Date().toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const getDefaultContent = () => {
    if (letterData.content) return letterData.content;
    
    return `Me dirijo a usted para expresar mi interés en la posición de ${letterData.position || '[Posición]'} en ${letterData.companyName || '[Empresa]'}.

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.title}>{profile?.jobTitle || 'Profesional'}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.contactInfo}>
              {profile?.email || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.phone || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.city}, {profile?.state || profile?.country}
            </Text>
          </View>
        </View>

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
        </View>

        {/* Subject */}
        {letterData.subject && (
          <Text style={styles.subject}>
            {letterData.subject}
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
            <View key={index} style={index === 1 ? styles.highlight : styles.paragraph}>
              <Text>
                {paragraph}
              </Text>
            </View>
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
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              Carta de Presentación
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>
              {formatDate(letterData.date)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
