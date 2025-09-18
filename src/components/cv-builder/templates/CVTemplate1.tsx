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
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
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
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  company: {
    fontSize: 10,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
  },
  description: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.4,
    marginTop: 3,
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  institution: {
    fontSize: 10,
    color: '#2563eb',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#f1f5f9',
    color: '#1e40af',
    padding: '3 8',
    margin: '2 4 2 0',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    marginRight: 15,
  },
  rightColumn: {
    flex: 1,
  },
});

interface CVTemplate1Props {
  profile: any;
}

export const CVTemplate1: React.FC<CVTemplate1Props> = ({ profile }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short' 
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
              {profile?.address || ''}
            </Text>
            <Text style={styles.contactInfo}>
              {profile?.city}, {profile?.state || profile?.country}
            </Text>
          </View>
        </View>

        {/* Professional Summary */}
        {profile?.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RESUMEN PROFESIONAL</Text>
            <Text style={styles.summary}>{profile.professionalSummary}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          <View style={styles.leftColumn}>
            {/* Experience */}
            {profile?.workExperience && profile.workExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
                {profile.workExperience.map((exp: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <View>
                        <Text style={styles.jobTitle}>{exp.position}</Text>
                        <Text style={styles.company}>{exp.company}</Text>
                      </View>
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EDUCACIÓN</Text>
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
          </View>

          <View style={styles.rightColumn}>
            {/* Skills */}
            {profile?.skillsWithLevel && profile.skillsWithLevel.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>HABILIDADES</Text>
                <View style={styles.skillsContainer}>
                  {profile.skillsWithLevel.map((skill: any, index: number) => (
                    <Text key={index} style={styles.skillTag}>
                      {skill.skill} ({skill.level})
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {/* Languages */}
            {profile?.languages && profile.languages.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>IDIOMAS</Text>
                {profile.languages.map((lang: any, index: number) => (
                  <View key={index} style={styles.educationItem}>
                    <Text style={styles.degree}>{lang.language}</Text>
                    <Text style={styles.date}>{lang.level}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Social Links */}
            {profile?.socialLinks && profile.socialLinks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ENLACES PROFESIONALES</Text>
                {profile.socialLinks.map((link: any, index: number) => (
                  <View key={index} style={styles.educationItem}>
                    <Text style={styles.degree}>{link.platform}</Text>
                    <Text style={styles.date}>{link.url}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Extracurricular Activities */}
            {profile?.extracurricularActivities && profile.extracurricularActivities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACTIVIDADES EXTRACURRICULARES</Text>
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
                <Text style={styles.sectionTitle}>LOGROS Y RECONOCIMIENTOS</Text>
                {profile.achievements.map((achievement: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{achievement.title}</Text>
                    <Text style={styles.company}>{achievement.issuer}</Text>
                    <Text style={styles.date}>{formatDate(achievement.date)}</Text>
                    <Text style={styles.description}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Academic Achievements */}
            {profile?.academicAchievements && profile.academicAchievements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>LOGROS ACADÉMICOS</Text>
                {profile.academicAchievements.map((achievement: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{achievement.title}</Text>
                    <Text style={styles.company}>{achievement.institution}</Text>
                    <Text style={styles.date}>{formatDate(achievement.date)}</Text>
                    <Text style={styles.description}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Work Experience */}
            {profile?.workExperience && profile.workExperience.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EXPERIENCIA LABORAL</Text>
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
                <Text style={styles.sectionTitle}>HISTORIAL ACADÉMICO</Text>
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
                <Text style={styles.sectionTitle}>PROYECTOS</Text>
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
                <Text style={styles.sectionTitle}>EMPRENDIMIENTOS</Text>
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
                <Text style={styles.sectionTitle}>PORTFOLIO Y APLICACIONES</Text>
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
                <Text style={styles.sectionTitle}>EMPLEOS REGISTRADOS</Text>
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
                <Text style={styles.sectionTitle}>CONTENIDO CREADO</Text>
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
                <Text style={styles.sectionTitle}>PUBLICACIONES Y RECURSOS</Text>
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

            {/* Achievements */}
            {profile?.achievements && profile.achievements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>LOGROS</Text>
                {profile.achievements.map((achievement: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{achievement.title}</Text>
                    <Text style={styles.company}>{achievement.issuer}</Text>
                    <Text style={styles.date}>{formatDate(achievement.date)}</Text>
                    <Text style={styles.description}>{achievement.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Certificates */}
            {profile?.certificates && profile.certificates.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CERTIFICADOS</Text>
                {profile.certificates.map((cert: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{cert.title}</Text>
                    <Text style={styles.company}>{cert.issuer}</Text>
                    <Text style={styles.date}>{formatDate(cert.issueDate)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Completed Courses */}
            {profile?.completedCourses && profile.completedCourses.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CURSOS COMPLETADOS</Text>
                {profile.completedCourses.map((course: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{course.title}</Text>
                    <Text style={styles.company}>{course.institution}</Text>
                    <Text style={styles.date}>{formatDate(course.completedAt)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Entrepreneurship */}
            {profile?.entrepreneurships && profile.entrepreneurships.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EMPRENDIMIENTOS</Text>
                {profile.entrepreneurships.map((business: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{business.name}</Text>
                    <Text style={styles.company}>{business.category} - {business.businessStage}</Text>
                    <Text style={styles.date}>{business.founded ? formatDate(business.founded) : 'En curso'}</Text>
                    <Text style={styles.description}>{business.description}</Text>
                    {business.website && (
                      <Text style={styles.description}>Website: {business.website}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Youth Applications (Portfolio) */}
            {profile?.youthApplications && profile.youthApplications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PORTFOLIO Y APLICACIONES</Text>
                {profile.youthApplications.map((application: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{application.title}</Text>
                    <Text style={styles.company}>Estado: {application.status}</Text>
                    <Text style={styles.date}>{formatDate(application.createdAt)}</Text>
                    <Text style={styles.description}>{application.description}</Text>
                    <Text style={styles.description}>
                      Vistas: {application.viewsCount} | Aplicaciones: {application.applicationsCount}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Company Employments */}
            {profile?.companyEmployments && profile.companyEmployments.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EMPLEOS REGISTRADOS</Text>
                {profile.companyEmployments.map((employment: any, index: number) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.jobTitle}>{employment.position}</Text>
                    <Text style={styles.company}>{employment.companyName}</Text>
                    <Text style={styles.date}>
                      {formatDate(employment.hiredAt)} - {employment.terminatedAt ? formatDate(employment.terminatedAt) : 'Actual'}
                    </Text>
                    {employment.notes && (
                      <Text style={styles.description}>{employment.notes}</Text>
                    )}
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
