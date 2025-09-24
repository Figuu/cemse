/**
 * Validador de entrada robusto para prevenir inyecciones
 * OWASP Top 10 - A03: Inyección & A08: Fallas de Integridad de Software y Datos
 */

// Import DOMPurify only on client-side to avoid SSR issues
let DOMPurify: any = null;
if (typeof window !== 'undefined') {
  DOMPurify = require('isomorphic-dompurify');
}

export interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'date' | 'boolean';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
  sanitizedData: { [key: string]: any };
}

export class InputValidator {
  // Patrones de inyección SQL comunes
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bcreate\b|\balter\b)/i,
    /(\bor\b|\band\b)\s*(\d+\s*=\s*\d+|'.+'\s*=\s*'.+')/i,
    /['"]\s*;\s*\w+/i,
    /--/,
    /\/\*/,
    /\bexec(\s|\()/i,
    /\bdeclare\b/i,
    /\bcast\b/i,
    /\bconvert\b/i
  ];

  // Patrones de XSS
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*>/gi,
    /<svg[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi
  ];

  // Patrones de path traversal
  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.\//g,
    /\.\.\\/g,
    /%2e%2e%2f/gi,
    /%2e%2e%5c/gi,
    /\.\.%2f/gi,
    /\.\.%5c/gi
  ];

  public static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: { [key: string]: string[] } = {};
    const sanitizedData: { [key: string]: any } = {};

    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const fieldErrors: string[] = [];

      // Verificar campo requerido
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(`${field} es requerido`);
        continue;
      }

      // Si el campo no es requerido y está vacío, saltarlo
      if (!rule.required && (value === undefined || value === null || value === '')) {
        sanitizedData[field] = value;
        continue;
      }

      // Validar tipo
      const typeValidation = this.validateType(value, rule.type || 'string');
      if (!typeValidation.isValid) {
        fieldErrors.push(`${field} debe ser de tipo ${rule.type}`);
      }

      // Sanitizar valor
      let sanitizedValue = this.sanitizeValue(value, rule.type || 'string');

      // Verificar inyecciones
      if (typeof sanitizedValue === 'string') {
        const injectionCheck = this.checkForInjections(sanitizedValue);
        if (!injectionCheck.isSafe) {
          fieldErrors.push(`${field} contiene contenido potencialmente peligroso: ${injectionCheck.threats.join(', ')}`);
        }
      }

      // Validar longitud (para strings)
      if (typeof sanitizedValue === 'string') {
        if (rule.minLength && sanitizedValue.length < rule.minLength) {
          fieldErrors.push(`${field} debe tener al menos ${rule.minLength} caracteres`);
        }
        if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
          fieldErrors.push(`${field} no puede tener más de ${rule.maxLength} caracteres`);
        }
      }

      // Validar rango numérico
      if (typeof sanitizedValue === 'number') {
        if (rule.min !== undefined && sanitizedValue < rule.min) {
          fieldErrors.push(`${field} debe ser mayor o igual a ${rule.min}`);
        }
        if (rule.max !== undefined && sanitizedValue > rule.max) {
          fieldErrors.push(`${field} debe ser menor o igual a ${rule.max}`);
        }
      }

      // Validar patrón
      if (rule.pattern && typeof sanitizedValue === 'string') {
        if (!rule.pattern.test(sanitizedValue)) {
          fieldErrors.push(`${field} no cumple con el formato requerido`);
        }
      }

      // Validación personalizada
      if (rule.custom) {
        const customError = rule.custom(sanitizedValue);
        if (customError) {
          fieldErrors.push(customError);
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      } else {
        sanitizedData[field] = sanitizedValue;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData
    };
  }

  private static validateType(value: any, expectedType: string): { isValid: boolean; convertedValue?: any } {
    switch (expectedType) {
      case 'string':
        return { isValid: typeof value === 'string' || value?.toString, convertedValue: value?.toString() };
      case 'number':
        const num = Number(value);
        return { isValid: !isNaN(num) && isFinite(num), convertedValue: num };
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return { isValid: typeof value === 'string' && emailRegex.test(value) };
      case 'url':
        try {
          new URL(value);
          return { isValid: true };
        } catch {
          return { isValid: false };
        }
      case 'date':
        const date = new Date(value);
        return { isValid: !isNaN(date.getTime()) };
      case 'boolean':
        return { isValid: typeof value === 'boolean' || value === 'true' || value === 'false' };
      default:
        return { isValid: true };
    }
  }

  private static sanitizeValue(value: any, type: string): any {
    if (value === null || value === undefined) {
      return value;
    }

    switch (type) {
      case 'string':
        const stringValue = value.toString();
        // Sanitizar HTML - usar DOMPurify si está disponible, sino usar regex
        let cleanHtml: string;
        if (DOMPurify) {
          cleanHtml = DOMPurify.sanitize(stringValue, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
          });
        } else {
          // Fallback sanitization for server-side
          cleanHtml = stringValue
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .replace(/<[^>]*>/g, '');
        }
        // Escapar caracteres especiales adicionales
        return cleanHtml
          .replace(/[<>]/g, '') // Remover < y > adicionales
          .trim();

      case 'number':
        return Number(value);

      case 'email':
        return value.toString().toLowerCase().trim();

      case 'url':
        return value.toString().trim();

      case 'date':
        return new Date(value);

      case 'boolean':
        if (typeof value === 'boolean') return value;
        return value === 'true' || value === true;

      default:
        return value;
    }
  }

  private static checkForInjections(input: string): { isSafe: boolean; threats: string[] } {
    const threats: string[] = [];

    // Verificar inyección SQL
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        threats.push('SQL Injection');
        break;
      }
    }

    // Verificar XSS
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(input)) {
        threats.push('XSS');
        break;
      }
    }

    // Verificar path traversal
    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(input)) {
        threats.push('Path Traversal');
        break;
      }
    }

    // Verificar inyección de comandos
    const commandPatterns = [
      /;\s*\w+/,
      /\|\s*\w+/,
      /&&\s*\w+/,
      /\$\(/,
      /`[^`]*`/
    ];

    for (const pattern of commandPatterns) {
      if (pattern.test(input)) {
        threats.push('Command Injection');
        break;
      }
    }

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  // Validar datos específicos de usuario
  public static validateUserData(data: any): ValidationResult {
    const userSchema: ValidationSchema = {
      email: {
        required: true,
        type: 'email',
        maxLength: 255
      },
      password: {
        required: true,
        type: 'string',
        minLength: 8,
        maxLength: 128
      },
      firstName: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      },
      lastName: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50,
        pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
      },
      phone: {
        required: false,
        type: 'string',
        pattern: /^[\+]?[0-9\(\)\-\s]+$/,
        maxLength: 20
      },
      address: {
        required: false,
        type: 'string',
        maxLength: 255
      }
    };

    return this.validate(data, userSchema);
  }

  // Validar consultas de búsqueda
  public static validateSearchQuery(query: string): { isValid: boolean; sanitizedQuery: string; errors: string[] } {
    const errors: string[] = [];

    if (!query || typeof query !== 'string') {
      return { isValid: false, sanitizedQuery: '', errors: ['Consulta de búsqueda inválida'] };
    }

    // Verificar inyecciones
    const injectionCheck = this.checkForInjections(query);
    if (!injectionCheck.isSafe) {
      errors.push(`Consulta contiene contenido peligroso: ${injectionCheck.threats.join(', ')}`);
    }

    // Sanitizar consulta
    let sanitizedQuery: string;
    if (DOMPurify) {
      sanitizedQuery = DOMPurify.sanitize(query, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    } else {
      // Fallback sanitization for server-side
      sanitizedQuery = query
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/<[^>]*>/g, '');
    }
    
    sanitizedQuery = sanitizedQuery
      .replace(/[<>'"`;\\]/g, '') // Remover caracteres potencialmente peligrosos
      .trim()
      .substring(0, 100); // Limitar longitud

    return {
      isValid: errors.length === 0,
      sanitizedQuery,
      errors
    };
  }
}