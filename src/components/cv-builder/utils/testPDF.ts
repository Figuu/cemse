// Test function to verify PDF generation works
export const testPDFGeneration = async () => {
  const testProfile = {
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+591 12345678',
    jobTitle: 'Desarrollador',
    summary: 'Desarrollador con experiencia en React y Node.js',
    institution: 'Universidad Mayor de San Andrés',
    degree: 'Ingeniería en Sistemas',
    skills: 'React, Node.js, JavaScript, TypeScript',
    languages: 'Español: Nativo, Inglés: Intermedio'
  };

  try {
    const { generateSimpleCV } = await import('./pdfGenerator');
    const blob = await generateSimpleCV(testProfile);
    
    console.log('PDF generation test successful!', {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    return { success: true, blob };
  } catch (error) {
    console.error('PDF generation test failed:', error);
    return { success: false, error };
  }
};

// Comprehensive test function for all generation methods
export const testAllGenerationMethods = async () => {
  const testProfile = {
    firstName: 'Ana',
    lastName: 'Martínez',
    email: 'ana.martinez@ejemplo.com',
    phone: '+591 99887766',
    jobTitle: 'Analista',
    summary: 'Analista de datos con experiencia en Python y SQL',
    institution: 'Universidad Privada',
    degree: 'Ciencias de la Computación',
    skills: 'Python, SQL, Excel, Power BI',
    languages: 'Español: Nativo, Inglés: Avanzado'
  };

  const results = {
    reactPDF: { success: false, error: null },
    html: { success: false, error: null },
    canvas: { success: false, error: null }
  };

  // Test react-pdf method
  try {
    const { generateSimpleCV } = await import('./pdfGenerator');
    const blob = await generateSimpleCV(testProfile);
    results.reactPDF = { success: true, error: null };
    console.log('✅ React-PDF method works');
  } catch (error) {
    results.reactPDF = { success: false, error: error };
    console.log('❌ React-PDF method failed:', error);
  }

  // Test HTML method
  try {
    const { generateHTMLCV } = await import('./pdfGenerator');
    const blob = await generateHTMLCV(testProfile);
    results.html = { success: true, error: null };
    console.log('✅ HTML method works');
  } catch (error) {
    results.html = { success: false, error: error };
    console.log('❌ HTML method failed:', error);
  }

  // Test Canvas method
  try {
    const { generateCanvasCV } = await import('./pdfGenerator');
    const blob = await generateCanvasCV(testProfile);
    results.canvas = { success: true, error: null };
    console.log('✅ Canvas method works');
  } catch (error) {
    results.canvas = { success: false, error: error };
    console.log('❌ Canvas method failed:', error);
  }

  const workingMethods = Object.values(results).filter(r => r.success).length;
  console.log(`📊 Test Results: ${workingMethods}/3 methods working`);

  return {
    success: workingMethods > 0,
    results,
    workingMethods
  };
};

// Function to test HTML CV generation
export const testHTMLCV = async () => {
  const testProfile = {
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@ejemplo.com',
    phone: '+591 87654321',
    jobTitle: 'Diseñadora',
    summary: 'Diseñadora gráfica con experiencia en branding',
    institution: 'Universidad Católica',
    degree: 'Diseño Gráfico',
    skills: 'Photoshop, Illustrator, InDesign',
    languages: 'Español: Nativo, Inglés: Avanzado'
  };

  try {
    const { generateHTMLCV } = await import('./pdfGenerator');
    const blob = await generateHTMLCV(testProfile);
    
    console.log('HTML CV generation test successful!', {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    return { success: true, blob };
  } catch (error) {
    console.error('HTML CV generation test failed:', error);
    return { success: false, error };
  }
};

// Function to test canvas CV generation (PNG image)
export const testCanvasCV = async () => {
  const testProfile = {
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@ejemplo.com',
    phone: '+591 11223344',
    jobTitle: 'Ingeniero',
    summary: 'Ingeniero de sistemas con experiencia en desarrollo web',
    institution: 'Universidad Técnica',
    degree: 'Ingeniería en Sistemas',
    skills: 'JavaScript, Python, React, Node.js',
    languages: 'Español: Nativo, Inglés: Intermedio'
  };

  try {
    const { generateCanvasCV } = await import('./pdfGenerator');
    const blob = await generateCanvasCV(testProfile);
    
    console.log('Canvas CV generation test successful!', {
      blobSize: blob.size,
      blobType: blob.type
    });
    
    return { success: true, blob };
  } catch (error) {
    console.error('Canvas CV generation test failed:', error);
    return { success: false, error };
  }
};
