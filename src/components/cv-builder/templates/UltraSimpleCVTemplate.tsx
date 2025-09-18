import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  title: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 10,
  },
  contact: {
    fontSize: 10,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    color: '#333333',
    marginBottom: 5,
  },
});

interface UltraSimpleCVTemplateProps {
  profile: any;
}

export const UltraSimpleCVTemplate: React.FC<UltraSimpleCVTemplateProps> = ({ profile }) => {
  // Safely extract data with fallbacks
  const firstName = profile?.firstName || 'Nombre';
  const lastName = profile?.lastName || 'Apellido';
  const email = profile?.email || 'email@ejemplo.com';
  const phone = profile?.phone || 'Teléfono';
  const jobTitle = profile?.jobTitle || 'Profesional';
  const summary = profile?.professionalSummary || 'Profesional dedicado con experiencia.';
  const institution = profile?.currentInstitution || 'Institución Educativa';
  const degree = profile?.currentDegree || profile?.educationLevel || 'Título';
  const skills = profile?.skills || ['Habilidades técnicas', 'Trabajo en equipo'];
  const languages = profile?.languages || [{ language: 'Español', level: 'Nativo' }];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{firstName} {lastName}</Text>
          <Text style={styles.title}>{jobTitle}</Text>
          <Text style={styles.contact}>{email} | {phone}</Text>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Profesional</Text>
          <Text style={styles.text}>{summary}</Text>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          <Text style={styles.text}>{institution}</Text>
          <Text style={styles.text}>{degree}</Text>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>
          <Text style={styles.text}>
            {Array.isArray(skills) ? skills.slice(0, 3).join(', ') : 'Habilidades técnicas'}
          </Text>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>
          <Text style={styles.text}>
            {Array.isArray(languages) 
              ? languages.slice(0, 2).map((lang: any) => `${lang.language || 'Idioma'}: ${lang.level || 'Intermedio'}`).join(', ')
              : 'Español: Nativo'
            }
          </Text>
        </View>
      </Page>
    </Document>
  );
};
