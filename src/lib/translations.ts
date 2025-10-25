// Translation helpers for course attributes

export function getCategoryLabel(category: string | null | undefined): string {
  if (!category) return '';

  const categoryMap: Record<string, string> = {
    'basic_competencies': 'Competencias Básicas',
    'entrepreneurship': 'Emprendimiento',
    'technical_skills': 'Habilidades Técnicas',
    'soft_skills': 'Habilidades Blandas',
    'personal_development': 'Desarrollo Personal',
    'business': 'Negocios',
    'technology': 'Tecnología',
    'marketing': 'Marketing',
    'finance': 'Finanzas',
    'management': 'Gestión',
    'leadership': 'Liderazgo',
    'communication': 'Comunicación',
  };

  return categoryMap[category] || category;
}

export function getLevelLabel(level: string | null | undefined): string {
  if (!level) return '';

  const levelMap: Record<string, string> = {
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'expert': 'Experto',
    'all_levels': 'Todos los niveles',
  };

  return levelMap[level] || level;
}

export function getEmploymentTypeLabel(type: string | null | undefined): string {
  if (!type) return '';

  const typeMap: Record<string, string> = {
    'full_time': 'Tiempo Completo',
    'part_time': 'Medio Tiempo',
    'contract': 'Contrato',
    'freelance': 'Freelance',
    'internship': 'Pasantía',
    'temporary': 'Temporal',
  };

  return typeMap[type] || type;
}

export function getBusinessStageLabel(stage: string | null | undefined): string {
  if (!stage) return '';

  const stageMap: Record<string, string> = {
    'idea': 'Idea',
    'startup': 'Startup',
    'growth': 'Crecimiento',
    'established': 'Establecido',
    'expansion': 'Expansión',
  };

  return stageMap[stage] || stage;
}

export function getSectorLabel(sector: string | null | undefined): string {
  if (!sector) return '';

  const sectorMap: Record<string, string> = {
    'technology': 'Tecnología',
    'education': 'Educación',
    'health': 'Salud',
    'finance': 'Finanzas',
    'retail': 'Comercio',
    'manufacturing': 'Manufactura',
    'services': 'Servicios',
    'agriculture': 'Agricultura',
    'construction': 'Construcción',
    'tourism': 'Turismo',
    'other': 'Otro',
  };

  return sectorMap[sector] || sector;
}

export function getTagLabel(tag: string | null | undefined): string {
  if (!tag) return '';

  const tagMap: Record<string, string> = {
    'basic_competencies': 'Competencias Básicas',
    'entrepreneurship': 'Emprendimiento',
    'technical_skills': 'Habilidades Técnicas',
    'soft_skills': 'Habilidades Blandas',
    'personal_development': 'Desarrollo Personal',
    'business': 'Negocios',
    'technology': 'Tecnología',
    'marketing': 'Marketing',
    'finance': 'Finanzas',
    'management': 'Gestión',
    'leadership': 'Liderazgo',
    'communication': 'Comunicación',
    'digital_literacy': 'Alfabetización Digital',
    'job_placement': 'Colocación Laboral',
    'design': 'Diseño',
    'languages': 'Idiomas',
    'health': 'Salud',
    'education': 'Educación',
    'arts': 'Artes',
    'science': 'Ciencia',
    'engineering': 'Ingeniería',
    'other': 'Otros',
  };

  return tagMap[tag] || tag;
}

export function getEducationLevelLabel(level: string | null | undefined): string {
  if (!level) return '';

  const educationMap: Record<string, string> = {
    'PRIMARY': 'Primaria',
    'SECONDARY': 'Secundaria',
    'HIGH_SCHOOL': 'Bachillerato',
    'TECHNICAL': 'Técnico',
    'UNIVERSITY': 'Universitario',
    'POSTGRADUATE': 'Postgrado',
    'GRADUATE': 'Postgrado',
    'OTHER': 'Otro',
  };

  return educationMap[level] || level;
}

export function getResourceTypeLabel(type: string | null | undefined): string {
  if (!type) return '';

  const resourceTypeMap: Record<string, string> = {
    'PDF': 'PDF',
    'DOC': 'Documento',
    'DOCX': 'Documento',
    'PPT': 'Presentación',
    'PPTX': 'Presentación',
    'XLS': 'Hoja de Cálculo',
    'XLSX': 'Hoja de Cálculo',
    'Video': 'Video',
    'VIDEO': 'Video',
    'Image': 'Imagen',
    'IMAGE': 'Imagen',
    'ZIP': 'Archivo ZIP',
    'URL': 'Enlace',
    'GUIDE': 'Guía',
    'TEMPLATE': 'Plantilla',
    'COURSE': 'Curso',
    'ARTICLE': 'Artículo',
    'AUDIO': 'Audio',
    'DOCUMENT': 'Documento',
    'TOOL': 'Herramienta',
    'CHECKLIST': 'Lista de Verificación',
    'WEBINAR': 'Seminario Web',
    'EBOOK': 'Libro Electrónico',
    'OTHER': 'Otro',
  };

  return resourceTypeMap[type] || type;
}
