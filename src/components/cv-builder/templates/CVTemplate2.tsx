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
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  contactInfo: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 11,
    color: '#333333',
    lineHeight: 1.6,
    textAlign: 'justify',
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  company: {
    fontSize: 11,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#666666',
    fontStyle: 'italic',
  },
  description: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
    marginTop: 5,
    textAlign: 'justify',
  },
  educationItem: {
    marginBottom: 12,
  },
  degree: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  institution: {
    fontSize: 11,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  skillsList: {
    flexDirection: 'column',
  },
  skillItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  skillName: {
    fontSize: 11,
    color: '#000000',
    fontWeight: 'bold',
    width: 100,
  },
  skillLevel: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  languagesList: {
    flexDirection: 'column',
  },
  languageItem: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  languageName: {
    fontSize: 11,
    color: '#000000',
    fontWeight: 'bold',
    width: 80,
  },
  languageLevel: {
    fontSize: 10,
    color: '#333333',
    flex: 1,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 3,
  },
  projectDescription: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  achievementItem: {
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  achievementIssuer: {
    fontSize: 10,
    color: '#333333',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    marginRight: 20,
  },
  rightColumn: {
    flex: 1,
  },
});

interface CVTemplate2Props {
  profile: any;
}

export const CVTemplate2: React.FC<CVTemplate2Props> = ({ profile }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long' 
    });
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.title}>{profile?.jobTitle || 'Profesional'}</Text>
          <Text style={styles.contactInfo}>
            {profile?.email || ''} | {profile?.phone || ''}
          </Text>
          <Text style={styles.contactInfo}>
            {profile?.address || ''}, {profile?.city}, {profile?.state || profile?.country}
          </Text>
        </View>

        {/* Professional Summary */}
        {profile?.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumen Profesional</Text>
            <Text style={styles.summary}>{profile.professionalSummary}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          <View style={styles.leftColumn}>
            {/* Experience */}
            {profile?.workExperience && profile.workExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
                {profile.workExperience.map((exp: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <Text style={styles.jobTitle}>{exp.position}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                      <Text style={styles.date}>
                        {formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Educación</Text>
              {profile?.educationHistory && profile.educationHistory.length > 0 ? (
                profile.educationHistory.map((edu: any, index: number) => (
                  <View key={index} style={styles.educationItem}>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.institution}>{edu.institution}</Text>
                    <Text style={styles.date}>
                      {formatDate(edu.startDate)} - {edu.current ? 'Presente' : formatDate(edu.endDate)}
                    </Text>
                    {edu.gpa && (
                      <Text style={styles.date}>Promedio: {edu.gpa}</Text>
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
                    <Text style={styles.date}>Año de graduación: {profile.graduationYear}</Text>
                  )}
                  {profile?.gpa && (
                    <Text style={styles.date}>Promedio: {profile.gpa}</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.rightColumn}>
            {/* Skills */}
            {profile?.skillsWithLevel && profile.skillsWithLevel.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Habilidades</Text>
                <View style={styles.skillsList}>
                  {profile.skillsWithLevel.map((skill: any, index: number) => (
                    <View key={index} style={styles.skillItem}>
                      <Text style={styles.skillName}>{skill.skill}:</Text>
                      <Text style={styles.skillLevel}>{skill.level}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {profile?.languages && profile.languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Idiomas</Text>
                <View style={styles.languagesList}>
                  {profile.languages.map((lang: any, index: number) => (
                    <View key={index} style={styles.languageItem}>
                      <Text style={styles.languageName}>{lang.language}:</Text>
                      <Text style={styles.languageLevel}>{lang.level}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Projects */}
            {profile?.projects && profile.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proyectos</Text>
                {profile.projects.map((project: any, index: number) => (
                  <View key={index} style={styles.projectItem}>
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectDescription}>{project.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Social Links */}
            {profile?.socialLinks && profile.socialLinks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Enlaces Profesionales</Text>
                <View style={styles.languagesList}>
                  {profile.socialLinks.map((link: any, index: number) => (
                    <View key={index} style={styles.languageItem}>
                      <Text style={styles.languageName}>{link.platform}</Text>
                      <Text style={styles.languageLevel}>{link.url}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Extracurricular Activities */}
            {profile?.extracurricularActivities && profile.extracurricularActivities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actividades Extracurriculares</Text>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Logros y Reconocimientos</Text>
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
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Logros Académicos</Text>
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

            {/* Work Experience */}
            {profile?.workExperience && profile.workExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
                {profile.workExperience.map((work: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{work.position}</Text>
                    <Text style={styles.company}>{work.company}</Text>
                    <Text style={styles.date}>
                      {formatDate(work.startDate)} - {work.current ? 'Actual' : formatDate(work.endDate)}
                    </Text>
                    <Text style={styles.description}>{work.description}</Text>
                    {work.location && <Text style={styles.date}>📍 {work.location}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Education History */}
            {profile?.educationHistory && profile.educationHistory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historial Académico</Text>
                {profile.educationHistory.map((edu: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{edu.degree} en {edu.field}</Text>
                    <Text style={styles.company}>{edu.institution}</Text>
                    <Text style={styles.date}>
                      {formatDate(edu.startDate)} - {edu.current ? 'Actual' : formatDate(edu.endDate)}
                    </Text>
                    {edu.gpa && <Text style={styles.date}>GPA: {edu.gpa}</Text>}
                    <Text style={styles.description}>{edu.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {profile?.projects && profile.projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proyectos</Text>
                {profile.projects.map((project: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{project.name}</Text>
                    <Text style={styles.date}>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </Text>
                    <Text style={styles.description}>{project.description}</Text>
                    {project.technologies && project.technologies.length > 0 && (
                      <Text style={styles.date}>Tecnologías: {project.technologies.join(', ')}</Text>
                    )}
                    {project.url && <Text style={styles.date}>🔗 {project.url}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Entrepreneurship */}
            {profile?.entrepreneurships && profile.entrepreneurships.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emprendimientos</Text>
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

            {/* Youth Applications (Portfolio) */}
            {profile?.youthApplications && profile.youthApplications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Portfolio y Aplicaciones</Text>
                {profile.youthApplications.map((application: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{application.title}</Text>
                    <Text style={styles.company}>Estado: {application.status}</Text>
                    <Text style={styles.date}>{formatDate(application.createdAt)}</Text>
                    <Text style={styles.description}>{application.description}</Text>
                    <Text style={styles.date}>
                      👁️ {application.viewsCount} vistas | 📝 {application.applicationsCount} aplicaciones
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Company Employments */}
            {profile?.companyEmployments && profile.companyEmployments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Empleos Registrados</Text>
                {profile.companyEmployments.map((employment: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{employment.position}</Text>
                    <Text style={styles.company}>{employment.companyName}</Text>
                    <Text style={styles.date}>
                      {formatDate(employment.hiredAt)} - {employment.terminatedAt ? formatDate(employment.terminatedAt) : 'Actual'}
                    </Text>
                    {employment.notes && <Text style={styles.description}>{employment.notes}</Text>}
                    {employment.salary > 0 && <Text style={styles.date}>💰 Salario: {employment.salary}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Entrepreneurship Posts (Content Creation) */}
            {profile?.entrepreneurshipPosts && profile.entrepreneurshipPosts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contenido Creado</Text>
                {profile.entrepreneurshipPosts.slice(0, 3).map((post: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{post.type}</Text>
                    <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
                    <Text style={styles.description}>{post.content.substring(0, 100)}...</Text>
                    <Text style={styles.date}>
                      👍 {post.likes} | 💬 {post.comments} | 📤 {post.shares} | 👁️ {post.views}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Entrepreneurship Resources (Publications) */}
            {profile?.entrepreneurshipResources && profile.entrepreneurshipResources.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Publicaciones y Recursos</Text>
                {profile.entrepreneurshipResources.slice(0, 3).map((resource: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{resource.title}</Text>
                    <Text style={styles.company}>{resource.category} - {resource.type}</Text>
                    <Text style={styles.date}>{formatDate(resource.createdAt)}</Text>
                    <Text style={styles.description}>{resource.description}</Text>
                    <Text style={styles.date}>
                      👁️ {resource.views} vistas | 👍 {resource.likes} likes
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
