import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Use default fonts to avoid CSP issues

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  contactInfo: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.4,
    marginBottom: 3,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summary: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    fontSize: 9,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 8,
    color: '#6b7280',
  },
  description: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
    marginTop: 4,
  },
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  institution: {
    fontSize: 9,
    color: '#2563eb',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  skillsContainer: {
    flexDirection: 'column',
  },
  skillItem: {
    marginBottom: 3,
  },
  skillText: {
    fontSize: 8,
    color: '#374151',
  },
  languageItem: {
    marginBottom: 3,
  },
  languageText: {
    fontSize: 8,
    color: '#374151',
  },
});

interface CVTemplate1Props {
  profile: any;
}

export const CVTemplate1: React.FC<CVTemplate1Props> = ({ profile }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.title}>{profile?.jobTitle || profile?.targetPosition || 'Profesional'}</Text>
            <View>
              {profile?.email && <Text style={styles.contactInfo}>Email: {profile.email}</Text>}
              {profile?.phone && <Text style={styles.contactInfo}>Tel: {profile.phone}</Text>}
              {profile?.address && <Text style={styles.contactInfo}>Dir: {profile.address}</Text>}
            </View>
          </View>
        </View>

        {/* Professional Summary */}
        {profile?.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={styles.summary}>{profile.professionalSummary}</Text>
          </View>
        )}

        {/* Experience */}
        {profile?.workExperience && profile.workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
            {profile.workExperience.slice(0, 3).map((exp: any, index: number) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.jobTitle}>{exp.position || exp.jobTitle}</Text>
                  <Text style={styles.date}>{exp.duration || exp.period}</Text>
                </View>
                <Text style={styles.company}>{exp.company || exp.employer}</Text>
                {exp.description && (
                  <Text style={styles.description}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {profile?.educationHistory && profile.educationHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Educación</Text>
            {profile.educationHistory.slice(0, 2).map((edu: any, index: number) => (
              <View key={index} style={styles.educationItem}>
                <View style={styles.experienceHeader}>
                  <Text style={styles.degree}>{edu.degree || edu.title}</Text>
                  <Text style={styles.date}>{edu.year || edu.graduationYear}</Text>
                </View>
                <Text style={styles.institution}>{edu.institution || edu.school}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Habilidades</Text>
            <View style={styles.skillsContainer}>
              {profile.skills.slice(0, 6).map((skill: any, index: number) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillText}>• {typeof skill === 'string' ? skill : skill.name || skill.skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Languages */}
        {profile?.languages && profile.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Idiomas</Text>
            <View style={styles.skillsContainer}>
              {profile.languages.slice(0, 3).map((lang: any, index: number) => (
                <View key={index} style={styles.languageItem}>
                  <Text style={styles.languageText}>• {typeof lang === 'string' ? lang : lang.language || lang.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};