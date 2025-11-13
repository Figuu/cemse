import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Create styles for the certificate
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logosContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  logo: {
    objectFit: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#47b4d8',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  certificateText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.5,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#47b4d8',
    textAlign: 'center',
    marginBottom: 20,
    textDecoration: 'underline',
  },
  courseDetails: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 1.4,
  },
  completionDate: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 40,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
    paddingTop: 20,
  },
  signature: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '45%',
  },
  signatureLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 10,
  },
  signatureText: {
    fontSize: 12,
    color: '#6b7280',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    border: '2px solid #47b4d8',
    borderRadius: 10,
  },
  decorativeElement: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    height: 2,
    backgroundColor: '#47b4d8',
    opacity: 0.3,
  },
});

interface CourseCertificateTemplateProps {
  studentName: string;
  courseTitle: string;
  instructorName: string;
  completionDate: string;
  courseDuration: string;
  courseLevel: string;
  institutionName?: string;
  logos?: {
    cemse: string;
    kallpa: string;
    manqa: string;
    childfund: string;
    stc: string;
    logo40: string;
  };
}

export const CourseCertificateTemplate: React.FC<CourseCertificateTemplateProps> = ({
  studentName,
  courseTitle,
  instructorName,
  completionDate,
  courseDuration,
  courseLevel,
  institutionName = 'Emplea Emprende - Centro de Emprendimiento y Desarrollo Sostenible',
  logos,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative border */}
        <View style={styles.border} />
        <View style={styles.decorativeElement} />

        {/* Header */}
        <View style={styles.header}>
          {/* Logos Row */}
          {logos && (
            <View style={styles.logosContainer}>
              {logos.cemse && (
                <Image
                  src={logos.cemse}
                  style={{ ...styles.logo, height: 60 }}
                />
              )}
              {logos.kallpa && (
                <Image
                  src={logos.kallpa}
                  style={{ ...styles.logo, height: 70 }}
                />
              )}
              {logos.manqa && (
                <Image
                  src={logos.manqa}
                  style={{ ...styles.logo, height: 60 }}
                />
              )}
              {logos.childfund && (
                <Image
                  src={logos.childfund}
                  style={{ ...styles.logo, height: 30 }}
                />
              )}
              {logos.stc && (
                <Image
                  src={logos.stc}
                  style={{ ...styles.logo, height: 55 }}
                />
              )}
              {logos.logo40 && (
                <Image
                  src={logos.logo40}
                  style={{ ...styles.logo, height: 60 }}
                />
              )}
            </View>
          )}

          <Text style={styles.title}>CERTIFICADO DE COMPLETACIÓN</Text>
          <Text style={styles.subtitle}>
            {institutionName}
          </Text>
        </View>

        {/* Main certificate content */}
        <View>
          <Text style={styles.certificateText}>
            Se certifica que
          </Text>
          
          <Text style={styles.studentName}>
            {studentName}
          </Text>
          
          <Text style={styles.certificateText}>
            ha completado exitosamente el curso
          </Text>
          
          <Text style={styles.courseDetails}>
            <Text style={{ fontWeight: 'bold', color: '#47b4d8' }}>
              "{courseTitle}"
            </Text>
          </Text>
          
          <Text style={styles.courseDetails}>
            Nivel: {courseLevel} • Duración: {courseDuration}
          </Text>
          
          <Text style={styles.completionDate}>
            Completado el {formatDate(completionDate)}
          </Text>
        </View>

        {/* Signature section */}
        <View style={styles.signatureSection}>
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Instructor del Curso</Text>
            <Text style={[styles.signatureText, { marginTop: 5, fontWeight: 'bold' }]}>
              {instructorName}
            </Text>
          </View>
          
          <View style={styles.signature}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Director Académico</Text>
            <Text style={[styles.signatureText, { marginTop: 5, fontWeight: 'bold' }]}>
              Emplea Emprende
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Este certificado es válido y puede ser verificado en el sistema de gestión académica de Emplea Emprende.
          </Text>
          <Text style={{ marginTop: 5 }}>
            Certificado generado digitalmente • ID: {Date.now().toString(36).toUpperCase()}
          </Text>
        </View>
      </Page>
    </Document>
  );
};


