import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
  },
  contactInfo: {
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
  },
  item: {
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  itemText: {
    fontSize: 10,
    color: '#6b7280',
  },
});

interface SimpleCVTemplateProps {
  profile: any;
}

export const SimpleCVTemplate: React.FC<SimpleCVTemplateProps> = ({ profile }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile?.firstName || 'Nombre'} {profile?.lastName || 'Apellido'}
          </Text>
          <Text style={styles.title}>
            {profile?.jobTitle || profile?.targetPosition || 'Profesional'}
          </Text>
          <Text style={styles.contactInfo}>
            {profile?.email || ''} | {profile?.phone || ''} | {profile?.city || ''}, {profile?.country || 'Bolivia'}
          </Text>
        </View>

        {/* Professional Summary */}
        {profile?.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={styles.itemText}>{profile.professionalSummary}</Text>
          </View>
        )}

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          {profile?.currentInstitution && (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{profile.currentInstitution}</Text>
              <Text style={styles.itemText}>
                {profile.currentDegree || profile.educationLevel || 'Estudiante'}
                {profile.graduationYear && ` - ${profile.graduationYear}`}
              </Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <Text style={styles.itemText}>
              {Array.isArray(profile.skills) ? profile.skills.join(', ') : 'Habilidades técnicas'}
            </Text>
          </View>
        )}

        {/* Languages */}
        {profile?.languages && profile.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            {profile.languages.map((lang: any, index: number) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemText}>
                  {lang.language || 'Idioma'}: {lang.level || 'Intermedio'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {profile?.workExperience && profile.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia</Text>
            {profile.workExperience.map((work: any, index: number) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemTitle}>{work.position || 'Posición'}</Text>
                <Text style={styles.itemText}>
                  {work.company || 'Empresa'} | {formatDate(work.startDate)} - {work.current ? 'Actual' : formatDate(work.endDate)}
                </Text>
                {work.description && (
                  <Text style={styles.itemText}>{work.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
