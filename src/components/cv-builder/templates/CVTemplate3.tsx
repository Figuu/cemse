import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Use default fonts to avoid CSP issues

const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.4,
  },
  sidebar: {
    width: '35%',
    backgroundColor: '#10b981',
    padding: 25,
    color: '#FFFFFF',
  },
  mainContent: {
    width: '65%',
    padding: 25,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 1.2,
  },
  title: {
    fontSize: 11,
    color: '#d1fae5',
    marginBottom: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 7,
    color: '#d1fae5',
    lineHeight: 1.3,
    marginBottom: 6,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#34d399',
    paddingBottom: 4,
  },
  skillItem: {
    marginBottom: 10,
  },
  skillName: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  mainSection: {
    marginBottom: 25,
  },
  mainSectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summary: {
    fontSize: 8,
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
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    fontSize: 8,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  date: {
    fontSize: 7,
    color: '#6b7280',
  },
  description: {
    fontSize: 7,
    color: '#6b7280',
    lineHeight: 1.4,
    marginTop: 4,
  },
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  institution: {
    fontSize: 8,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 2,
  },
});

interface CVTemplate3Props {
  profile: any;
}

export const CVTemplate3: React.FC<CVTemplate3Props> = ({ profile }) => {
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
            <Text style={styles.title}>{profile?.jobTitle || profile?.targetPosition || 'Profesional'}</Text>
            <View>
              {profile?.email && <Text style={styles.contactInfo}>Email: {profile.email}</Text>}
              {profile?.phone && <Text style={styles.contactInfo}>Tel: {profile.phone}</Text>}
              {profile?.address && <Text style={styles.contactInfo}>Dir: {profile.address}</Text>}
            </View>
          </View>

          {/* Skills */}
          {profile?.skills && profile.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              {profile.skills.slice(0, 6).map((skill: any, index: number) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>
                    {typeof skill === 'string' ? skill : skill.name || skill.skill}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Idiomas</Text>
              {profile.languages.slice(0, 3).map((lang: any, index: number) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>
                    {typeof lang === 'string' ? lang : lang.language || lang.name}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Professional Summary */}
          {profile?.professionalSummary && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Resumen Profesional</Text>
              <Text style={styles.summary}>{profile.professionalSummary}</Text>
            </View>
          )}

          {/* Experience */}
          {profile?.workExperience && profile.workExperience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Experiencia Laboral</Text>
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
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Educación</Text>
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
        </View>
      </Page>
    </Document>
  );
};