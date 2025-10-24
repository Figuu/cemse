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
