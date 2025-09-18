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
    marginBottom: 25,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
    lineHeight: 1.2,
  },
  title: {
    fontSize: 12,
    color: '#d1fae5',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  contactInfo: {
    fontSize: 8,
    color: '#d1fae5',
    lineHeight: 1.3,
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#34d399',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 9,
    color: '#d1fae5',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  skillItem: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  skillLevel: {
    fontSize: 8,
    color: '#d1fae5',
  },
  languageItem: {
    marginBottom: 8,
  },
  languageName: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  languageLevel: {
    fontSize: 8,
    color: '#d1fae5',
  },
  mainSection: {
    marginBottom: 20,
  },
  mainSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
    paddingBottom: 3,
  },
  experienceItem: {
    marginBottom: 15,
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  experienceHeader: {
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  company: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 8,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
    marginTop: 5,
  },
  educationItem: {
    marginBottom: 12,
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  institution: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  projectItem: {
    marginBottom: 12,
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  projectName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  achievementItem: {
    marginBottom: 10,
    paddingLeft: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  achievementIssuer: {
    fontSize: 9,
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
  },
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  techTag: {
    backgroundColor: '#f3f4f6',
    color: '#10b981',
    padding: '2 6',
    margin: '1 3 1 0',
    borderRadius: 2,
    fontSize: 7,
    fontWeight: 'bold',
  },
});

interface CVTemplate3Props {
  profile: any;
}

export const CVTemplate3: React.FC<CVTemplate3Props> = ({ profile }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
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
        return '';
      }
      
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch (error) {
      return '';
    }
  };

  const getExperienceLevel = (level: string) => {
    switch (level) {
      case 'NO_EXPERIENCE': return 'Sin experiencia';
      case 'ENTRY_LEVEL': return 'Nivel inicial (0-2 años)';
      case 'MID_LEVEL': return 'Nivel medio (3-5 años)';
      case 'SENIOR_LEVEL': return 'Nivel senior (6+ años)';
      default: return level;
    }
  };

  const getEducationLevel = (level: string) => {
    switch (level) {
      case 'PRIMARY': return 'Primaria';
      case 'SECONDARY': return 'Secundaria';
      case 'TECHNICAL': return 'Técnico';
      case 'UNIVERSITY': return 'Universitario';
      case 'POSTGRADUATE': return 'Postgrado';
      case 'OTHER': return 'Otro';
      default: return level;
    }
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
          {profile?.skillsWithLevel && profile.skillsWithLevel.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              {profile.skillsWithLevel.map((skill: any, index: number) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.skill}</Text>
                  <Text style={styles.skillLevel}>{skill.level}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {profile?.languages && profile.languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Idiomas</Text>
              {profile.languages.map((lang: any, index: number) => (
                <View key={index} style={styles.languageItem}>
                  <Text style={styles.languageName}>{lang.language}</Text>
                  <Text style={styles.languageLevel}>{lang.level}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Professional Summary */}
          {profile?.professionalSummary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfil</Text>
              <Text style={styles.summary}>{profile.professionalSummary}</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Experience */}
          {profile?.workExperience && profile.workExperience.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Experiencia</Text>
              {profile.workExperience.map((exp: any, index: number) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.jobTitle}>{exp.position}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                    <Text style={styles.date}>
                      {formatDate(exp.startDate)} - {exp.current ? 'Actual' : formatDate(exp.endDate)}
                    </Text>
                  </View>
                  {exp.description && (
                    <Text style={styles.description}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          <View style={styles.mainSection}>
            <Text style={styles.mainSectionTitle}>Educación</Text>
            {profile?.educationHistory && profile.educationHistory.length > 0 ? (
              profile.educationHistory.map((edu: any, index: number) => (
                <View key={index} style={styles.educationItem}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.institution}>{edu.institution}</Text>
                  <Text style={styles.date}>
                    {formatDate(edu.startDate)} - {edu.current ? 'Actual' : formatDate(edu.endDate)}
                  </Text>
                  {edu.gpa && (
                    <Text style={styles.date}>GPA: {edu.gpa}</Text>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.educationItem}>
                <Text style={styles.degree}>
                  {profile?.currentDegree || getEducationLevel(profile?.educationLevel || '')}
                </Text>
                <Text style={styles.institution}>
                  {profile?.currentInstitution || profile?.universityName}
                </Text>
                {profile?.graduationYear && (
                  <Text style={styles.date}>Graduación: {profile.graduationYear}</Text>
                )}
                {profile?.gpa && (
                  <Text style={styles.date}>GPA: {profile.gpa}</Text>
                )}
              </View>
            )}
          </View>

          {/* Projects */}
          {profile?.projects && profile.projects.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Proyectos</Text>
              {profile.projects.map((project: any, index: number) => (
                <View key={index} style={styles.projectItem}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectDescription}>{project.description}</Text>
                  {project.technologies && project.technologies.length > 0 && (
                    <View style={styles.techStack}>
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <Text key={techIndex} style={styles.techTag}>
                          {tech}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Social Links */}
          {profile?.socialLinks && profile.socialLinks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enlaces Profesionales</Text>
              {profile.socialLinks.map((link: any, index: number) => (
                <View key={index} style={styles.languageItem}>
                  <Text style={styles.languageName}>{link.platform}</Text>
                  <Text style={styles.languageLevel}>{link.url}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Extracurricular Activities */}
          {profile?.extracurricularActivities && profile.extracurricularActivities.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Actividades Extracurriculares</Text>
              {profile.extracurricularActivities.map((activity: any, index: number) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.jobTitle}>{activity.activity}</Text>
                  <Text style={styles.company}>{activity.organization}</Text>
                  <Text style={styles.date}>
                    {formatDate(activity.startDate)} - {activity.current ? 'Actual' : formatDate(activity.endDate)}
                  </Text>
                  <Text style={styles.description}>{activity.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Achievements */}
          {profile?.achievements && profile.achievements.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Logros y Reconocimientos</Text>
              {profile.achievements.map((achievement: any, index: number) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementIssuer}>{achievement.issuer}</Text>
                  <Text style={styles.achievementDate}>{formatDate(achievement.date)}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Academic Achievements */}
          {profile?.academicAchievements && profile.academicAchievements.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Logros Académicos</Text>
              {profile.academicAchievements.map((achievement: any, index: number) => (
                <View key={index} style={styles.achievementItem}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementIssuer}>{achievement.institution}</Text>
                  <Text style={styles.achievementDate}>{formatDate(achievement.date)}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Entrepreneurship */}
          {profile?.entrepreneurships && profile.entrepreneurships.length > 0 && (
            <View style={styles.mainSection}>
              <Text style={styles.mainSectionTitle}>Emprendimientos</Text>
              {profile.entrepreneurships.map((business: any, index: number) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.jobTitle}>{business.name}</Text>
                  <Text style={styles.company}>{business.category} - {business.businessStage}</Text>
                  <Text style={styles.date}>{business.founded ? formatDate(business.founded) : 'En curso'}</Text>
                  <Text style={styles.description}>{business.description}</Text>
                  {business.website && <Text style={styles.date}>🌐 {business.website}</Text>}
                  {business.employees > 0 && <Text style={styles.date}>👥 {business.employees} empleados</Text>}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
