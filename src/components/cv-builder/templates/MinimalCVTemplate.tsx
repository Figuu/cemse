import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
  },
  contactInfo: {
    fontSize: 11,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 5,
  },
  item: {
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  itemText: {
    fontSize: 11,
    color: '#666666',
  },
});

interface MinimalCVTemplateProps {
  profile: any;
}

export const MinimalCVTemplate: React.FC<MinimalCVTemplateProps> = ({ profile }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile?.firstName || 'Nombre'} {profile?.lastName || 'Apellido'}
          </Text>
          <Text style={styles.title}>
            {profile?.jobTitle || 'Profesional'}
          </Text>
          <Text style={styles.contactInfo}>
            {profile?.email || 'email@ejemplo.com'} | {profile?.phone || 'Teléfono'} | {profile?.city || 'Ciudad'}, {profile?.country || 'Bolivia'}
          </Text>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Profesional</Text>
          <Text style={styles.itemText}>
            {profile?.professionalSummary || 'Profesional dedicado con experiencia en el área.'}
          </Text>
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          <View style={styles.item}>
            <Text style={styles.itemTitle}>
              {profile?.currentInstitution || 'Institución Educativa'}
            </Text>
            <Text style={styles.itemText}>
              {profile?.currentDegree || profile?.educationLevel || 'Título o Grado'}
              {profile?.graduationYear && ` - ${profile.graduationYear}`}
            </Text>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>
          <Text style={styles.itemText}>
            {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 
              ? profile.skills.slice(0, 5).join(', ')
              : 'Habilidades técnicas, Trabajo en equipo, Comunicación'
            }
          </Text>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>
          <Text style={styles.itemText}>
            {profile?.languages && Array.isArray(profile.languages) && profile.languages.length > 0
              ? profile.languages.map((lang: any) => `${lang.language || 'Idioma'}: ${lang.level || 'Intermedio'}`).join(', ')
              : 'Español: Nativo, Inglés: Intermedio'
            }
          </Text>
        </View>
      </Page>
    </Document>
  );
};
