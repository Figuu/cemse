import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Ultra-simple PDF generator that should work in all cases
export const generateSimpleCV = async (profileData: any) => {
  // Create the most basic styles possible
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 12,
    },
    title: {
      fontSize: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    text: {
      fontSize: 10,
      marginBottom: 3,
    },
  });

  // Create the document
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          {profileData.firstName || 'Nombre'} {profileData.lastName || 'Apellido'}
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <Text style={styles.text}>Email: {profileData.email || 'email@ejemplo.com'}</Text>
          <Text style={styles.text}>Teléfono: {profileData.phone || 'Teléfono'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Profesional</Text>
          <Text style={styles.text}>{profileData.summary || 'Profesional dedicado con experiencia.'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educación</Text>
          <Text style={styles.text}>{profileData.institution || 'Institución Educativa'}</Text>
          <Text style={styles.text}>{profileData.degree || 'Título o Grado'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>
          <Text style={styles.text}>{profileData.skills || 'Habilidades técnicas, Trabajo en equipo'}</Text>
        </View>
      </Page>
    </Document>
  );

  // Generate PDF
  const pdfDoc = pdf(<MyDocument />);
  return await pdfDoc.toBlob();
};

// Alternative PDF generator using HTML to PDF conversion
export const generateHTMLCV = (profileData: any) => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      // Create HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>CV - ${profileData.firstName || 'Nombre'} ${profileData.lastName || 'Apellido'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 20px;
            }
            .name {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 5px;
            }
            .title {
              font-size: 16px;
              color: #64748b;
              margin-bottom: 10px;
            }
            .contact {
              font-size: 12px;
              color: #666;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 10px;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .section-content {
              font-size: 12px;
              color: #374151;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="name">${profileData.firstName || 'Nombre'} ${profileData.lastName || 'Apellido'}</div>
            <div class="title">${profileData.jobTitle || 'Profesional'}</div>
            <div class="contact">${profileData.email || 'email@ejemplo.com'} | ${profileData.phone || 'Teléfono'}</div>
          </div>

          <div class="section">
            <div class="section-title">Resumen Profesional</div>
            <div class="section-content">${profileData.summary || 'Profesional dedicado con experiencia.'}</div>
          </div>

          <div class="section">
            <div class="section-title">Educación</div>
            <div class="section-content">${profileData.institution || 'Institución Educativa'}</div>
            <div class="section-content">${profileData.degree || 'Título o Grado'}</div>
          </div>

          <div class="section">
            <div class="section-title">Habilidades</div>
            <div class="section-content">${profileData.skills || 'Habilidades técnicas, Trabajo en equipo'}</div>
          </div>

          <div class="section">
            <div class="section-title">Idiomas</div>
            <div class="section-content">${profileData.languages || 'Español: Nativo, Inglés: Intermedio'}</div>
          </div>
        </body>
        </html>
      `;

      // Create a blob from HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};

// Alternative PDF generator using canvas (creates PNG image)
export const generateCanvasCV = (profileData: any) => {
  return new Promise<Blob>((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      // Set canvas size (A4 dimensions in pixels at 96 DPI)
      canvas.width = 794; // A4 width
      canvas.height = 1123; // A4 height

      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';

      // Draw title
      const title = `${profileData.firstName || 'Nombre'} ${profileData.lastName || 'Apellido'}`;
      ctx.fillText(title, canvas.width / 2, 100);

      // Draw sections
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      
      let y = 150;
      const lineHeight = 25;

      // Contact info
      ctx.fillText('Información de Contacto', 50, y);
      y += lineHeight;
      ctx.font = '12px Arial';
      ctx.fillText(`Email: ${profileData.email || 'email@ejemplo.com'}`, 50, y);
      y += lineHeight;
      ctx.fillText(`Teléfono: ${profileData.phone || 'Teléfono'}`, 50, y);
      y += lineHeight * 2;

      // Summary
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Resumen Profesional', 50, y);
      y += lineHeight;
      ctx.font = '12px Arial';
      ctx.fillText(profileData.summary || 'Profesional dedicado con experiencia.', 50, y);
      y += lineHeight * 2;

      // Education
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Educación', 50, y);
      y += lineHeight;
      ctx.font = '12px Arial';
      ctx.fillText(profileData.institution || 'Institución Educativa', 50, y);
      y += lineHeight;
      ctx.fillText(profileData.degree || 'Título o Grado', 50, y);
      y += lineHeight * 2;

      // Skills
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Habilidades', 50, y);
      y += lineHeight;
      ctx.font = '12px Arial';
      ctx.fillText(profileData.skills || 'Habilidades técnicas, Trabajo en equipo', 50, y);

      // Convert canvas to PNG blob (not PDF)
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
};
