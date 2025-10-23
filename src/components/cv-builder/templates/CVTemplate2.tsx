import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Use default fonts to avoid CSP issues

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    letterSpacing: 1,
  },
  title: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 18,
    fontStyle: 'italic',
  },
  contactInfo: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 4,
  },
  summary: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 18,
  },
  experienceHeader: {
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  company: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  date: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.5,
    marginTop: 6,
    textAlign: 'justify',
  },
  educationItem: {
    marginBottom: 15,
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  institution: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  skillsContainer: {
    flexDirection: 'column',
  },
  skillItem: {
    marginBottom: 3,
  },
  skillText: {
    fontSize: 9,
    color: '#333333',
  },
  languageItem: {
    marginBottom: 3,
  },
  languageText: {
    fontSize: 9,
    color: '#333333',
  },
});

interface CVTemplate2Props {
  profile: any;
}

export const CVTemplate2: React.FC<CVTemplate2Props> = ({ profile }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Centered */}
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
                  <Text style={styles.company}>{exp.company || exp.employer}</Text>
                  <Text style={styles.date}>{exp.duration || exp.period}</Text>
                </View>
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
                <Text style={styles.degree}>{edu.degree || edu.title}</Text>
                <Text style={styles.institution}>{edu.institution || edu.school}</Text>
                <Text style={styles.date}>{edu.year || edu.graduationYear}</Text>
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