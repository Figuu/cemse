/**
 * Validador de contraseñas robustas
 * OWASP Top 10 - A07: Fallas de Identificación y Autenticación
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong';
  score: number;
}

export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;

  // Lista de contraseñas comunes que deben ser rechazadas
  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', '1234567890', 'Password1', 'iloveyou',
    'princess', 'rockyou', '1234567', '12345678', 'sunshine', 'andrew',
    'jordan23', 'superman', 'rainbow', 'master', 'computer', 'monkey'
  ];

  public static validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Validar longitud mínima
    if (!password || password.length < this.MIN_LENGTH) {
      errors.push(`La contraseña debe tener al menos ${this.MIN_LENGTH} caracteres`);
    } else {
      score += 1;
    }

    // Validar longitud máxima
    if (password && password.length > this.MAX_LENGTH) {
      errors.push(`La contraseña no puede tener más de ${this.MAX_LENGTH} caracteres`);
    }

    // Verificar contraseñas comunes
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Esta contraseña es demasiado común y no es segura');
    } else {
      score += 1;
    }

    // Verificar complejidad de caracteres
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUppercase) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    } else {
      score += 1;
    }

    if (!hasLowercase) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    } else {
      score += 1;
    }

    if (!hasNumbers) {
      errors.push('La contraseña debe contener al menos un número');
    } else {
      score += 1;
    }

    if (!hasSpecialChars) {
      errors.push('La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)');
    } else {
      score += 1;
    }

    // Verificar patrones secuenciales
    if (this.hasSequentialPattern(password)) {
      errors.push('La contraseña no debe contener patrones secuenciales como "123" o "abc"');
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }

    // Verificar repetición de caracteres
    if (this.hasRepeatedChars(password)) {
      errors.push('La contraseña no debe tener más de 2 caracteres consecutivos idénticos');
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }

    // Calcular fortaleza
    const strength = this.calculateStrength(score);
    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      strength,
      score
    };
  }

  private static hasSequentialPattern(password: string): boolean {
    // Verificar secuencias numéricas ascendentes/descendentes
    for (let i = 0; i <= password.length - 3; i++) {
      const char1 = password.charCodeAt(i);
      const char2 = password.charCodeAt(i + 1);
      const char3 = password.charCodeAt(i + 2);

      // Secuencia ascendente
      if (char2 === char1 + 1 && char3 === char2 + 1) {
        return true;
      }
      // Secuencia descendente
      if (char2 === char1 - 1 && char3 === char2 - 1) {
        return true;
      }
    }

    // Verificar secuencias comunes en el teclado
    const keyboardSequences = [
      'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'
    ];

    const lowerPassword = password.toLowerCase();
    for (const sequence of keyboardSequences) {
      if (lowerPassword.includes(sequence)) {
        return true;
      }
    }

    return false;
  }

  private static hasRepeatedChars(password: string): boolean {
    for (let i = 0; i <= password.length - 3; i++) {
      if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
        return true;
      }
    }
    return false;
  }

  private static calculateStrength(score: number): 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' {
    if (score <= 2) return 'very-weak';
    if (score <= 3) return 'weak';
    if (score <= 5) return 'fair';
    if (score <= 6) return 'good';
    return 'strong';
  }

  // Generar contraseña segura
  public static generateSecurePassword(length: number = 16): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>';

    const allChars = lowercase + uppercase + numbers + specialChars;
    let password = '';

    // Asegurar al menos un carácter de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Completar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}