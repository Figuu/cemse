import { BusinessPlanTemplate, BusinessPlanSection, BusinessPlanField } from "./businessPlanTemplates";

export interface ValidationResult {
  isValid: boolean;
  score: number;
  maxScore: number;
  percentage: number;
  errors: ValidationError[];
  _warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  sectionScores: SectionScore[];
}

export interface ValidationError {
  fieldId: string;
  sectionId: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  fieldId: string;
  sectionId: string;
  message: string;
  suggestion?: string;
}

export interface ValidationSuggestion {
  fieldId: string;
  sectionId: string;
  message: string;
  priority: "high" | "medium" | "low";
}

export interface SectionScore {
  sectionId: string;
  sectionName: string;
  score: number;
  maxScore: number;
  percentage: number;
  completeness: number;
}

export class BusinessPlanValidationService {
  /**
   * Validate a complete business plan
   */
  static validateBusinessPlan(
    template: BusinessPlanTemplate,
    data: Record<string, unknown>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const _warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    const sectionScores: SectionScore[] = [];

    let totalScore = 0;
    let maxScore = 0;

    // Validate each section
    template.sections.forEach((section) => {
      const sectionResult = this.validateSection(section, data);
      
      sectionScores.push({
        sectionId: section.id,
        sectionName: section.title,
        score: sectionResult.score,
        maxScore: sectionResult.maxScore,
        percentage: sectionResult.percentage,
        completeness: sectionResult.completeness
      });

      totalScore += sectionResult.score;
      maxScore += sectionResult.maxScore;
      
      errors.push(...sectionResult.errors);
      _warnings.push(...sectionResult._warnings);
      suggestions.push(...sectionResult.suggestions);
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const isValid = errors.filter(e => e.severity === "error").length === 0;

    return {
      isValid,
      score: totalScore,
      maxScore,
      percentage,
      errors,
      _warnings,
      suggestions,
      sectionScores
    };
  }

  /**
   * Validate a specific section
   */
  private static validateSection(
    section: BusinessPlanSection,
    data: Record<string, unknown>
  ): {
    score: number;
    maxScore: number;
    percentage: number;
    completeness: number;
    errors: ValidationError[];
    _warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const errors: ValidationError[] = [];
    const _warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    let score = 0;
    let maxScore = 0;
    let completedFields = 0;
    const totalFields = section.fields.length;

    section.fields.forEach((field) => {
      const fieldResult = this.validateField(field, data[field.id]);
      
      if (fieldResult.isValid) {
        score += fieldResult.score;
        completedFields++;
      }
      
      maxScore += fieldResult.maxScore;
      
      errors.push(...fieldResult.errors.map(e => ({
        ...e,
        sectionId: section.id
      })));
      
      _warnings.push(...fieldResult._warnings.map(w => ({
        ...w,
        sectionId: section.id
      })));
      
      suggestions.push(...fieldResult.suggestions.map(s => ({
        ...s,
        sectionId: section.id
      })));
    });

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const completeness = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;

    return {
      score,
      maxScore,
      percentage,
      completeness,
      errors,
      _warnings,
      suggestions
    };
  }

  /**
   * Validate a specific field
   */
  private static validateField(
    field: BusinessPlanField,
    value: unknown
  ): {
    isValid: boolean;
    score: number;
    maxScore: number;
    errors: ValidationError[];
    _warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const errors: ValidationError[] = [];
    const _warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];
    
    let score = 0;
    const maxScore = 10; // Base score for each field

    // Check if field is required and has value
    if (field.required) {
      if (value === undefined || value === null || value === "") {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: `${field.label} es requerido`,
          severity: "error"
        });
        return { isValid: false, score: 0, maxScore, errors, _warnings, suggestions };
      }
    }

    // If no value, return early
    if (value === undefined || value === null || value === "") {
      return { isValid: true, score: 0, maxScore, errors, _warnings, suggestions };
    }

    // Field-specific validation
    switch (field.type) {
      case "text":
      case "textarea":
        score += this.validateTextField(field, value as string, errors, _warnings, suggestions);
        break;
      case "number":
      case "currency":
        score += this.validateNumberField(field, value as number, errors, _warnings, suggestions);
        break;
      case "table":
        score += this.validateTableField(field, value, errors, _warnings, suggestions);
        break;
      case "multiselect":
        score += this.validateMultiselectField(field, value as string[], errors, _warnings, suggestions);
        break;
      default:
        score += 5; // Default score for other field types
    }

    // Quality scoring based on content
    if (field.type === "textarea" && typeof value === "string") {
      score += this.scoreTextQuality(value, field.id);
    }

    return {
      isValid: errors.length === 0,
      score: Math.min(score, maxScore),
      maxScore,
      errors,
      _warnings,
      suggestions
    };
  }

  /**
   * Validate text fields
   */
  private static validateTextField(
    field: BusinessPlanField,
    value: string,
    errors: ValidationError[],
    __warnings: ValidationWarning[],
    __suggestions: ValidationSuggestion[]
  ): number {
    let score = 0;

    // Length validation
    if (field.validation) {
      const { minLength, maxLength } = field.validation;
      
      if (minLength && value.length < minLength) {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: `Mínimo ${minLength} caracteres requeridos`,
          severity: "error"
        });
        return 0;
      }
      
      if (maxLength && value.length > maxLength) {
        __warnings.push({
          fieldId: field.id,
          sectionId: "",
          message: `Máximo ${maxLength} caracteres recomendados`,
          suggestion: "Considera acortar el texto"
        });
      }
    }

    // Content quality checks
    if (value.length >= 50) {
      score += 2; // Bonus for substantial content
    }

    if (value.length >= 100) {
      score += 2; // Bonus for detailed content
    }

    // Check for specific keywords based on field type
    if (field.id.includes("problem") || field.id.includes("solution")) {
      if (this.containsBusinessKeywords(value)) {
        score += 2;
      }
    }

    if (field.id.includes("market") || field.id.includes("competition")) {
      if (this.containsMarketKeywords(value)) {
        score += 2;
      }
    }

    if (field.id.includes("financial") || field.id.includes("revenue")) {
      if (this.containsFinancialKeywords(value)) {
        score += 2;
      }
    }

    return score;
  }

  /**
   * Validate number fields
   */
  private static validateNumberField(
    field: BusinessPlanField,
    value: number,
    errors: ValidationError[],
    __warnings: ValidationWarning[],
    __suggestions: ValidationSuggestion[]
  ): number {
    let score = 0;

    if (field.validation) {
      const { min, max } = field.validation;
      
      if (min !== undefined && value < min) {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: `Valor mínimo: ${min}`,
          severity: "error"
        });
        return 0;
      }
      
      if (max !== undefined && value > max) {
        __warnings.push({
          fieldId: field.id,
          sectionId: "",
          message: `Valor máximo recomendado: ${max}`,
          suggestion: "Verifica que el valor sea realista"
        });
      }
    }

    // Score based on value reasonableness
    if (field.id.includes("revenue") || field.id.includes("income")) {
      if (value > 0) {
        score += 3;
        if (value >= 10000) {
          score += 2; // Bonus for substantial revenue projections
        }
      }
    }

    if (field.id.includes("employees") || field.id.includes("team")) {
      if (value > 0) {
        score += 3;
        if (value >= 5) {
          score += 2; // Bonus for team size
        }
      }
    }

    if (field.id.includes("funding") || field.id.includes("investment")) {
      if (value > 0) {
        score += 3;
        if (value >= 50000) {
          score += 2; // Bonus for substantial funding
        }
      }
    }

    return score;
  }

  /**
   * Validate table fields
   */
  private static validateTableField(
    field: BusinessPlanField,
    value: unknown,
    errors: ValidationError[],
    __warnings: ValidationWarning[],
    __suggestions: ValidationSuggestion[]
  ): number {
    let score = 0;

    const tableValue = value as { rows?: Record<string, unknown>[] };
    if (!tableValue || !tableValue.rows || tableValue.rows.length === 0) {
      if (field.required) {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: "Tabla requerida con al menos una fila",
          severity: "error"
        });
      }
      return 0;
    }

    // Check if table has data
    const hasData = tableValue.rows.some((row: Record<string, unknown>) => 
      Object.values(row).some(cell => cell !== "" && cell !== null && cell !== undefined)
    );

    if (!hasData) {
      if (field.required) {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: "La tabla debe contener datos",
          severity: "error"
        });
      }
      return 0;
    }

    score += 5; // Base score for having data

    // Check for completeness
    const filledCells = tableValue.rows.reduce((count: number, row: Record<string, unknown>) => {
      return count + Object.values(row).filter(cell => 
        cell !== "" && cell !== null && cell !== undefined
      ).length;
    }, 0);

    const totalCells = tableValue.rows.length * (tableValue as { headers: string[] }).headers.length;
    const completeness = totalCells > 0 ? (filledCells / totalCells) * 100 : 0;

    if (completeness >= 80) {
      score += 3;
    } else if (completeness >= 50) {
      score += 2;
    } else {
      __warnings.push({
        fieldId: field.id,
        sectionId: "",
        message: `Solo ${Math.round(completeness)}% de las celdas están completas`,
        suggestion: "Completa más celdas para mejorar la calidad"
      });
    }

    return score;
  }

  /**
   * Validate multiselect fields
   */
  private static validateMultiselectField(
    field: BusinessPlanField,
    value: string[],
    errors: ValidationError[],
    __warnings: ValidationWarning[],
    __suggestions: ValidationSuggestion[]
  ): number {
    let score = 0;

    if (!value || value.length === 0) {
      if (field.required) {
        errors.push({
          fieldId: field.id,
          sectionId: "",
          message: "Selecciona al menos una opción",
          severity: "error"
        });
      }
      return 0;
    }

    score += 3; // Base score for having selections

    if (value.length >= 3) {
      score += 2; // Bonus for multiple selections
    }

    if (value.length >= 5) {
      score += 2; // Bonus for comprehensive selections
    }

    return score;
  }

  /**
   * Score text quality based on content
   */
  private static scoreTextQuality(text: string, fieldId: string): number {
    let score = 0;

    // Check for business-specific content
    if (this.containsBusinessKeywords(text)) {
      score += 1;
    }

    // Check for data and numbers
    if (/\d+/.test(text)) {
      score += 1;
    }

    // Check for specific terms based on field
    if (fieldId.includes("problem") && this.containsProblemKeywords(text)) {
      score += 1;
    }

    if (fieldId.includes("solution") && this.containsSolutionKeywords(text)) {
      score += 1;
    }

    if (fieldId.includes("market") && this.containsMarketKeywords(text)) {
      score += 1;
    }

    if (fieldId.includes("financial") && this.containsFinancialKeywords(text)) {
      score += 1;
    }

    return score;
  }

  /**
   * Check if text contains business keywords
   */
  private static containsBusinessKeywords(text: string): boolean {
    const keywords = [
      "negocio", "empresa", "startup", "mercado", "cliente", "producto", "servicio",
      "ingresos", "ventas", "ganancias", "competencia", "estrategia", "objetivo"
    ];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Check if text contains problem keywords
   */
  private static containsProblemKeywords(text: string): boolean {
    const keywords = [
      "problema", "dificultad", "desafío", "necesidad", "dolor", "frustración",
      "ineficiencia", "costo", "tiempo", "calidad", "acceso", "disponibilidad"
    ];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Check if text contains solution keywords
   */
  private static containsSolutionKeywords(text: string): boolean {
    const keywords = [
      "solución", "innovación", "tecnología", "plataforma", "app", "software",
      "proceso", "método", "herramienta", "servicio", "producto", "mejora"
    ];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Check if text contains market keywords
   */
  private static containsMarketKeywords(text: string): boolean {
    const keywords = [
      "mercado", "industria", "sector", "competencia", "competidor", "tendencia",
      "crecimiento", "oportunidad", "demanda", "oferta", "precio", "valor"
    ];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Check if text contains financial keywords
   */
  private static containsFinancialKeywords(text: string): boolean {
    const keywords = [
      "ingresos", "gastos", "ganancias", "pérdidas", "inversión", "financiamiento",
      "presupuesto", "flujo", "caja", "rentabilidad", "margen", "retorno"
    ];
    return keywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Get validation summary
   */
  static getValidationSummary(result: ValidationResult): {
    status: "excellent" | "good" | "fair" | "poor";
    message: string;
    nextSteps: string[];
  } {
    const { percentage, errors, _warnings: warnings, suggestions } = result;
    const errorCount = errors.filter(e => e.severity === "error").length;
    const warningCount = warnings.length;
    const suggestionCount = suggestions.length;

    let status: "excellent" | "good" | "fair" | "poor";
    let message: string;
    let nextSteps: string[] = [];

    if (percentage >= 90 && errorCount === 0) {
      status = "excellent";
      message = "¡Excelente! Tu plan de negocios está muy completo y bien estructurado.";
      nextSteps = [
        "Revisa las sugerencias para optimizar aún más tu plan",
        "Considera agregar más detalles en las secciones con menor puntuación",
        "Prepara una presentación ejecutiva basada en tu plan"
      ];
    } else if (percentage >= 75 && errorCount <= 2) {
      status = "good";
      message = "Buen trabajo. Tu plan de negocios está bien desarrollado con algunas áreas de mejora.";
      nextSteps = [
        "Corrige los errores identificados",
        "Completa las secciones con menor puntuación",
        "Agrega más detalles en las áreas sugeridas"
      ];
    } else if (percentage >= 50 && errorCount <= 5) {
      status = "fair";
      message = "Tu plan de negocios tiene una base sólida pero necesita más desarrollo.";
      nextSteps = [
        "Prioriza corregir los errores críticos",
        "Completa todas las secciones requeridas",
        "Agrega más contenido detallado en cada sección",
        "Considera buscar asesoramiento adicional"
      ];
    } else {
      status = "poor";
      message = "Tu plan de negocios necesita trabajo significativo para ser efectivo.";
      nextSteps = [
        "Completa todas las secciones requeridas",
        "Corrige todos los errores identificados",
        "Agrega contenido sustancial en cada sección",
        "Considera usar una plantilla más simple",
        "Busca asesoramiento profesional"
      ];
    }

    if (errorCount > 0) {
      nextSteps.unshift(`Corrige ${errorCount} error${errorCount > 1 ? 'es' : ''} crítico${errorCount > 1 ? 's' : ''}`);
    }

    if (warningCount > 0) {
      nextSteps.push(`Revisa ${warningCount} advertencia${warningCount > 1 ? 's' : ''}`);
    }

    if (suggestionCount > 0) {
      nextSteps.push(`Considera ${suggestionCount} sugerencia${suggestionCount > 1 ? 's' : ''} de mejora`);
    }

    return { status, message, nextSteps };
  }
}
