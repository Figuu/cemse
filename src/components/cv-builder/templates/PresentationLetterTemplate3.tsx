import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Use system fonts instead of external fonts to avoid DataView errors

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  sidebar: {
    width: '30%',
    backgroundColor: '#8b5cf6',
    padding: 25,
    color: '#FFFFFF',
  },
  mainContent: {
    width: '70%',
    padding: 30,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 25,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  title: {
    fontSize: 11,
    color: '#e9d5ff',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 8,
    color: '#e9d5ff',
    lineHeight: 1.3,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#a78bfa',
    paddingBottom: 3,
  },
  skillsList: {
    flexDirection: 'column',
  },
  skillItem: {
    marginBottom: 5,
  },
  skillName: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#8b5cf6',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
  },
  recipientInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#faf5ff',
    borderRadius: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  recipientName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  recipientTitle: {
    fontSize: 9,
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
  subject: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f3e8ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  greeting: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 15,
  },
  paragraph: {
    marginBottom: 10,
  },
  highlight: {
    backgroundColor: '#f3e8ff',
    padding: 10,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: '#8b5cf6',
    marginBottom: 10,
  },
  closing: {
    marginTop: 20,
    marginBottom: 10,
  },
  closingText: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 25,
  },
  signature: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

interface PresentationLetterTemplate3Props {
  profile: any;
  letterData: any;
}

export const PresentationLetterTemplate3: React.FC<PresentationLetterTemplate3Props> = ({ 
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
        {/* Sidebar */}
        <View style={styles.sidebar}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.title}>{profile?.jobTitle || 'Profesional'}</Text>
          </View>

          {/* Contact Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <Text style={styles.contactInfo}>
              {profile?.email || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.phone || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.address || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.city}, {profile?.state || profile?.country}
            </Text>
          </View>

          {/* Skills */}
          {profile?.skillsWithLevel && Array.isArray(profile.skillsWithLevel) && profile.skillsWithLevel.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              <View style={styles.skillsList}>
                {profile.skillsWithLevel.slice(0, 5).map((skill: any, index: number) => (
                  <View key={index} style={styles.skillItem}>
                    <Text style={styles.skillName}>{skill?.skill || skill || 'Habilidad'}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Professional Summary */}
          {profile?.professionalSummary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfil</Text>
              <Text style={styles.contactInfo}>
                {profile.professionalSummary.substring(0, 150)}...
              </Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.mainHeader}>
            <Text style={styles.mainTitle}>Carta de Presentación</Text>
            <Text style={styles.date}>
              {formatDate(letterData.date)}
            </Text>
          </View>

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
            <Text style={styles.footerText}>
              Carta de Presentación Profesional
            </Text>
            <Text style={styles.footerText}>
              {formatDate(letterData.date)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
