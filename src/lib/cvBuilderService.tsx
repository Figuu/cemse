import { prisma } from "@/lib/prisma";
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { pdf } from '@react-pdf/renderer';

// Register fonts for better PDF rendering
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 'bold' },
  ]
});

export interface CVData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    avatarUrl?: string;
  };
  experiences: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    current: boolean;
  }>;
  skills: Array<{
    name: string;
    level: number;
  }>;
  languages?: Array<{
    name: string;
    level: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  achievements?: Array<{
    title: string;
    description: string;
    date: string;
  }>;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: "professional" | "creative" | "academic";
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: "modern",
    name: "Moderno",
    description: "Diseño limpio y profesional con colores modernos",
    preview: "/templates/cv-modern-preview.png",
    category: "professional"
  },
  {
    id: "classic",
    name: "Clásico",
    description: "Estilo tradicional y elegante para sectores conservadores",
    preview: "/templates/cv-classic-preview.png",
    category: "professional"
  },
  {
    id: "creative",
    name: "Creativo",
    description: "Diseño innovador para perfiles creativos y artísticos",
    preview: "/templates/cv-creative-preview.png",
    category: "creative"
  }
];

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #3B82F6',
    paddingBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  contactItem: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: 5,
  },
  summary: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  position: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  company: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  date: {
    fontSize: 10,
    color: '#6B7280',
  },
  description: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillItem: {
    backgroundColor: '#F3F4F6',
    padding: '4px 8px',
    margin: '2px 4px 2px 0',
    borderRadius: 4,
    fontSize: 9,
    color: '#374151',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    width: '48%',
  },
  rightColumn: {
    width: '48%',
  },
});

// Modern Template Component
const ModernCVTemplate = ({ data }: { data: CVData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personalInfo.fullName}</Text>
        <Text style={styles.title}>{data.personalInfo.title}</Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
          <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
          <Text style={styles.contactItem}>{data.personalInfo.address}</Text>
        </View>
      </View>

      {/* Summary */}
      {data.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Profesional</Text>
          <Text style={styles.summary}>{data.personalInfo.summary}</Text>
        </View>
      )}

      <View style={styles.twoColumn}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          {/* Experience */}
          {data.experiences.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experiencia</Text>
              {data.experiences.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={styles.position}>{exp.position}</Text>
                      <Text style={styles.company}>{exp.company}</Text>
                    </View>
                    <Text style={styles.date}>
                      {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.description}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.educations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Educación</Text>
              {data.educations.map((edu, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={styles.position}>{edu.degree}</Text>
                      <Text style={styles.company}>{edu.institution}</Text>
                    </View>
                    <Text style={styles.date}>
                      {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          {/* Skills */}
          {data.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habilidades</Text>
              <View style={styles.skillsContainer}>
                {data.skills.map((skill, index) => (
                  <Text key={index} style={styles.skillItem}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Idiomas</Text>
              {data.languages.map((lang, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.position}>{lang.name}</Text>
                  <Text style={styles.description}>{lang.level}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Proyectos</Text>
              {data.projects.map((project, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.position}>{project.name}</Text>
                  <Text style={styles.description}>{project.description}</Text>
                  {project.technologies.length > 0 && (
                    <View style={styles.skillsContainer}>
                      {project.technologies.map((tech, techIndex) => (
                        <Text key={techIndex} style={styles.skillItem}>
                          {tech}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Logros</Text>
              {data.achievements.map((achievement, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.position}>{achievement.title}</Text>
                  <Text style={styles.description}>{achievement.description}</Text>
                  <Text style={styles.date}>{achievement.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
);

// Classic Template Component
const ClassicCVTemplate = ({ data }: { data: CVData }) => (
  <Document>
    <Page size="A4" style={[styles.page, { backgroundColor: '#FAFAFA' }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottom: '3px solid #1F2937' }]}>
        <Text style={[styles.name, { fontSize: 32, color: '#1F2937' }]}>
          {data.personalInfo.fullName}
        </Text>
        <Text style={[styles.title, { fontSize: 18, color: '#4B5563' }]}>
          {data.personalInfo.title}
        </Text>
        <View style={styles.contactInfo}>
          <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
          <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
          <Text style={styles.contactItem}>{data.personalInfo.address}</Text>
        </View>
      </View>

      {/* Summary */}
      {data.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18, color: '#1F2937' }]}>
            Resumen Profesional
          </Text>
          <Text style={[styles.summary, { fontSize: 12 }]}>
            {data.personalInfo.summary}
          </Text>
        </View>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18, color: '#1F2937' }]}>
            Experiencia Profesional
          </Text>
          {data.experiences.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View>
                  <Text style={[styles.position, { fontSize: 14 }]}>{exp.position}</Text>
                  <Text style={[styles.company, { color: '#1F2937' }]}>{exp.company}</Text>
                </View>
                <Text style={styles.date}>
                  {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                </Text>
              </View>
              <Text style={[styles.description, { fontSize: 11 }]}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.educations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18, color: '#1F2937' }]}>
            Formación Académica
          </Text>
          {data.educations.map((edu, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.experienceHeader}>
                <View>
                  <Text style={[styles.position, { fontSize: 14 }]}>{edu.degree}</Text>
                  <Text style={[styles.company, { color: '#1F2937' }]}>{edu.institution}</Text>
                </View>
                <Text style={styles.date}>
                  {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: 18, color: '#1F2937' }]}>
            Competencias
          </Text>
          <View style={styles.skillsContainer}>
            {data.skills.map((skill, index) => (
              <Text key={index} style={[styles.skillItem, { backgroundColor: '#E5E7EB' }]}>
                {skill.name}
              </Text>
            ))}
          </View>
        </View>
      )}
    </Page>
  </Document>
);

// Creative Template Component
const CreativeCVTemplate = ({ data }: { data: CVData }) => (
  <Document>
    <Page size="A4" style={[styles.page, { backgroundColor: '#F8FAFC' }]}>
      {/* Header with colored background */}
      <View style={[styles.header, { 
        backgroundColor: '#3B82F6', 
        color: 'white',
        padding: 20,
        margin: -30,
        marginBottom: 20,
      }]}>
        <Text style={[styles.name, { color: 'white', fontSize: 30 }]}>
          {data.personalInfo.fullName}
        </Text>
        <Text style={[styles.title, { color: '#E0E7FF', fontSize: 16 }]}>
          {data.personalInfo.title}
        </Text>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactItem, { color: '#E0E7FF' }]}>
            {data.personalInfo.email}
          </Text>
          <Text style={[styles.contactItem, { color: '#E0E7FF' }]}>
            {data.personalInfo.phone}
          </Text>
          <Text style={[styles.contactItem, { color: '#E0E7FF' }]}>
            {data.personalInfo.address}
          </Text>
        </View>
      </View>

      {/* Summary */}
      {data.personalInfo.summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
            Sobre Mí
          </Text>
          <Text style={styles.summary}>{data.personalInfo.summary}</Text>
        </View>
      )}

      <View style={styles.twoColumn}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          {/* Experience */}
          {data.experiences.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Experiencia
              </Text>
              {data.experiences.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={[styles.position, { color: '#1F2937' }]}>{exp.position}</Text>
                      <Text style={[styles.company, { color: '#3B82F6' }]}>{exp.company}</Text>
                    </View>
                    <Text style={styles.date}>
                      {exp.startDate} - {exp.current ? 'Presente' : exp.endDate}
                    </Text>
                  </View>
                  <Text style={styles.description}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.educations.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Educación
              </Text>
              {data.educations.map((edu, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <View>
                      <Text style={[styles.position, { color: '#1F2937' }]}>{edu.degree}</Text>
                      <Text style={[styles.company, { color: '#3B82F6' }]}>{edu.institution}</Text>
                    </View>
                    <Text style={styles.date}>
                      {edu.startDate} - {edu.current ? 'Presente' : edu.endDate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          {/* Skills */}
          {data.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Habilidades
              </Text>
              <View style={styles.skillsContainer}>
                {data.skills.map((skill, index) => (
                  <Text key={index} style={[styles.skillItem, { backgroundColor: '#3B82F6', color: 'white' }]}>
                    {skill.name}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Idiomas
              </Text>
              {data.languages.map((lang, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={[styles.position, { color: '#1F2937' }]}>{lang.name}</Text>
                  <Text style={styles.description}>{lang.level}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Proyectos
              </Text>
              {data.projects.map((project, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={[styles.position, { color: '#1F2937' }]}>{project.name}</Text>
                  <Text style={styles.description}>{project.description}</Text>
                  {project.technologies.length > 0 && (
                    <View style={styles.skillsContainer}>
                      {project.technologies.map((tech, techIndex) => (
                        <Text key={techIndex} style={[styles.skillItem, { backgroundColor: '#E5E7EB', color: '#374151' }]}>
                          {tech}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: '#3B82F6' }]}>
                Logros
              </Text>
              {data.achievements.map((achievement, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={[styles.position, { color: '#1F2937' }]}>{achievement.title}</Text>
                  <Text style={styles.description}>{achievement.description}</Text>
                  <Text style={styles.date}>{achievement.date}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
);

export class CVBuilderService {
  /**
   * Generate CV PDF with selected template using react-pdf
   */
  static async generateCV(
    userId: string,
    templateId: string,
    cvData: CVData
  ): Promise<string | null> {
    try {
      // Validate template
      const template = CV_TEMPLATES.find(t => t.id === templateId);
      if (!template) {
        throw new Error("Invalid template ID");
      }

      // Get user profile data
      const profile = await prisma.profile.findUnique({
        where: { userId },
        include: {
          user: true,
        },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Merge profile data with CV data
      const mergedData: CVData = {
        personalInfo: {
          fullName: cvData.personalInfo.fullName || `${profile.firstName} ${profile.lastName}`,
          title: cvData.personalInfo.title || '',
          email: cvData.personalInfo.email || profile.user.email || '',
          phone: cvData.personalInfo.phone || profile.phone || '',
          address: cvData.personalInfo.address || profile.address || '',
          summary: cvData.personalInfo.summary || '',
          avatarUrl: cvData.personalInfo.avatarUrl || profile.avatarUrl || undefined,
        },
        experiences: cvData.experiences || [],
        educations: cvData.educations || [],
        skills: cvData.skills || [],
        languages: cvData.languages || [],
        projects: cvData.projects || [],
        achievements: cvData.achievements || [],
      };

      // Generate PDF based on template
      let pdfDocument;
      switch (templateId) {
        case 'modern':
          pdfDocument = <ModernCVTemplate data={mergedData} />;
          break;
        case 'classic':
          pdfDocument = <ClassicCVTemplate data={mergedData} />;
          break;
        case 'creative':
          pdfDocument = <CreativeCVTemplate data={mergedData} />;
          break;
        default:
          throw new Error("Template not implemented");
      }

      // Generate PDF buffer
      const pdfStream = await pdf(pdfDocument).toBlob();

      // Save to file system (in production, this should be saved to MinIO or similar)
      const fileName = `cv-${userId}-${Date.now()}.pdf`;
      const filePath = `public/uploads/cv/${fileName}`;
      
      // Ensure directory exists
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Convert blob to buffer and write file
      const arrayBuffer = await pdfStream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      // Return public URL
      return `/uploads/cv/${fileName}`;

    } catch (error) {
      console.error("Error generating CV:", error);
      throw error;
    }
  }

  /**
   * Generate Cover Letter PDF
   */
  static async generateCoverLetter(
    userId: string,
    coverLetterData: {
      recipientName: string;
      recipientTitle: string;
      companyName: string;
      content: string;
      senderName: string;
      senderTitle: string;
      senderEmail: string;
      senderPhone: string;
    }
  ): Promise<string | null> {
    try {
      const CoverLetterTemplate = ({ data }: { data: typeof coverLetterData }) => (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.header}>
              <Text style={styles.name}>{data.senderName}</Text>
              <Text style={styles.title}>{data.senderTitle}</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactItem}>{data.senderEmail}</Text>
                <Text style={styles.contactItem}>{data.senderPhone}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.contactItem}>
                {new Date().toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.contactItem}>{data.recipientName}</Text>
              <Text style={styles.contactItem}>{data.recipientTitle}</Text>
              <Text style={styles.contactItem}>{data.companyName}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.contactItem}>Estimado/a {data.recipientName},</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.summary, { fontSize: 12, lineHeight: 1.6 }]}>
                {data.content}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.contactItem}>Atentamente,</Text>
              <Text style={styles.contactItem}>{data.senderName}</Text>
            </View>
          </Page>
        </Document>
      );

      const pdfStream = await pdf(<CoverLetterTemplate data={coverLetterData} />).toBlob();

      const fileName = `cover-letter-${userId}-${Date.now()}.pdf`;
      const filePath = `public/uploads/cover-letters/${fileName}`;
      
      const fs = await import('fs');
      const path = await import('path');
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Convert blob to buffer and write file
      const arrayBuffer = await pdfStream.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      return `/uploads/cover-letters/${fileName}`;

    } catch (error) {
      console.error("Error generating cover letter:", error);
      throw error;
    }
  }

  /**
   * Save CV data to database
   */
  static async saveCVData(userId: string, cvData: CVData): Promise<void> {
    try {
      await prisma.profile.update({
        where: { userId },
        data: {
          workExperience: cvData.experiences as any,
          educationHistory: cvData.educations as any,
          skills: cvData.skills as any,
          languages: cvData.languages as any,
          projects: cvData.projects as any,
          achievements: cvData.achievements as any,
          professionalSummary: cvData.personalInfo.summary,
        },
      });
    } catch (error) {
      console.error("Error saving CV data:", error);
      throw error;
    }
  }

  /**
   * Get CV data from database
   */
  static async getCVData(userId: string): Promise<CVData | null> {
    try {
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: { 
          workExperience: true,
          educationHistory: true,
          skills: true,
          languages: true,
          projects: true,
          achievements: true,
          professionalSummary: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          user: {
            select: { email: true }
          }
        },
      });

      if (!profile) {
        return null;
      }

      // Construct CVData from profile fields
      const cvData: CVData = {
        personalInfo: {
          fullName: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
          title: '',
          email: profile.user.email,
          phone: profile.phone || '',
          address: profile.address || '',
          summary: profile.professionalSummary || '',
        },
        experiences: (profile.workExperience as any) || [],
        educations: (profile.educationHistory as any) || [],
        skills: (profile.skills as any) || [],
        languages: (profile.languages as any) || [],
        projects: (profile.projects as any) || [],
        achievements: (profile.achievements as any) || [],
      };

      return cvData;
    } catch (error) {
      console.error("Error getting CV data:", error);
      return null;
    }
  }
}