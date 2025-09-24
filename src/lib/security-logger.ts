/**
 * Sistema de logging de seguridad
 * OWASP Top 10 - A09: Fallas de Registro y Monitoreo de Seguridad
 */

export type SecurityEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET_REQUESTED'
  | 'AUTH_PASSWORD_RESET_COMPLETED'
  | 'AUTH_ACCOUNT_LOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INJECTION_ATTEMPT'
  | 'XSS_ATTEMPT'
  | 'PATH_TRAVERSAL_ATTEMPT'
  | 'UNAUTHORIZED_ACCESS_ATTEMPT'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'
  | 'DATA_MODIFICATION'
  | 'SENSITIVE_DATA_ACCESS'
  | 'FILE_UPLOAD'
  | 'ADMIN_ACTION'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECURITY_POLICY_VIOLATION';

export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  resource?: string;
  details: Record<string, any>;
  success: boolean;
  message: string;
}

export interface SecurityLogConfig {
  enableConsoleLogging: boolean;
  enableFileLogging: boolean;
  enableDatabaseLogging: boolean;
  logLevel: SecurityEventSeverity;
  includeSensitiveData: boolean;
}

class SecurityLogger {
  private config: SecurityLogConfig;
  private logBuffer: SecurityEvent[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  constructor(config: Partial<SecurityLogConfig> = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableFileLogging: false,
      enableDatabaseLogging: false,
      logLevel: 'medium',
      includeSensitiveData: false,
      ...config
    };
  }

  private generateEventId(): string {
    return `SEC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverityWeight(severity: SecurityEventSeverity): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[severity];
  }

  private shouldLog(eventSeverity: SecurityEventSeverity): boolean {
    return this.getSeverityWeight(eventSeverity) >= this.getSeverityWeight(this.config.logLevel);
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    if (this.config.includeSensitiveData) {
      return details;
    }

    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'authorization',
      'cookie', 'session', 'ssn', 'creditCard', 'bankAccount'
    ];

    const sanitized = { ...details };

    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

        if (isSensitive) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  public log(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    message: string,
    details: Record<string, any> = {},
    request?: {
      userId?: string;
      sessionId?: string;
      ipAddress?: string;
      userAgent?: string;
      endpoint?: string;
      method?: string;
    }
  ): void {
    if (!this.shouldLog(severity)) {
      return;
    }

    const event: SecurityEvent = {
      id: this.generateEventId(),
      type,
      severity,
      timestamp: new Date().toISOString(),
      userId: request?.userId,
      sessionId: request?.sessionId,
      ipAddress: request?.ipAddress,
      userAgent: request?.userAgent,
      endpoint: request?.endpoint,
      method: request?.method,
      details: this.sanitizeDetails(details),
      success: !details.error && !details.failed,
      message
    };

    // Log inmediato basado en configuración
    if (this.config.enableConsoleLogging) {
      this.logToConsole(event);
    }

    // Agregar al buffer para procesamiento posterior
    this.logBuffer.push(event);

    // Limpiar buffer si está lleno
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.flushBuffer();
    }

    // Para eventos críticos, procesar inmediatamente
    if (severity === 'critical') {
      this.handleCriticalEvent(event);
    }
  }

  private logToConsole(event: SecurityEvent): void {
    const logMethod = this.getConsoleMethod(event.severity);
    const logMessage = `[SECURITY ${event.severity.toUpperCase()}] ${event.type}: ${event.message}`;

    logMethod(logMessage, {
      id: event.id,
      timestamp: event.timestamp,
      userId: event.userId,
      ipAddress: event.ipAddress,
      endpoint: event.endpoint,
      details: event.details
    });
  }

  private getConsoleMethod(severity: SecurityEventSeverity): (...args: any[]) => void {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      default:
        return console.info;
    }
  }

  private handleCriticalEvent(event: SecurityEvent): void {
    // Aquí se pueden implementar notificaciones inmediatas
    // por ejemplo, envío de alertas por email, Slack, etc.
    console.error(`🚨 ALERTA DE SEGURIDAD CRÍTICA: ${event.message}`, event);

    // En un entorno real, aquí se enviarían notificaciones a administradores
    if (process.env.NODE_ENV === 'production') {
      // this.sendSecurityAlert(event);
    }
  }

  private flushBuffer(): void {
    if (this.logBuffer.length === 0) return;

    // En un entorno real, aquí se guardarían los logs en base de datos o archivo
    if (this.config.enableDatabaseLogging) {
      // this.saveToDatabase(this.logBuffer);
    }

    if (this.config.enableFileLogging) {
      // this.saveToFile(this.logBuffer);
    }

    this.logBuffer = [];
  }

  // Métodos de conveniencia para eventos comunes
  public logLoginAttempt(userId: string, success: boolean, ipAddress?: string, details: Record<string, any> = {}): void {
    this.log(
      success ? 'AUTH_LOGIN_SUCCESS' : 'AUTH_LOGIN_FAILED',
      success ? 'low' : 'medium',
      `Login ${success ? 'exitoso' : 'fallido'} para usuario ${userId}`,
      { ...details, userId, success },
      { userId, ipAddress }
    );
  }

  public logRateLimitExceeded(identifier: string, action: string, ipAddress?: string): void {
    this.log(
      'RATE_LIMIT_EXCEEDED',
      'high',
      `Rate limit excedido para ${identifier} en acción ${action}`,
      { identifier, action, blocked: true },
      { ipAddress }
    );
  }

  public logInjectionAttempt(type: 'sql' | 'xss' | 'command', input: string, endpoint?: string, userId?: string): void {
    this.log(
      type === 'sql' ? 'INJECTION_ATTEMPT' : 'XSS_ATTEMPT',
      'high',
      `Intento de inyección ${type.toUpperCase()} detectado`,
      { injectionType: type, suspiciousInput: input.substring(0, 100), blocked: true },
      { endpoint, userId }
    );
  }

  public logUnauthorizedAccess(endpoint: string, userId?: string, ipAddress?: string, details: Record<string, any> = {}): void {
    this.log(
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'high',
      `Intento de acceso no autorizado a ${endpoint}`,
      { ...details, blocked: true },
      { endpoint, userId, ipAddress }
    );
  }

  public logPrivilegeEscalation(userId: string, attemptedRole: string, currentRole: string, ipAddress?: string): void {
    this.log(
      'PRIVILEGE_ESCALATION_ATTEMPT',
      'critical',
      `Intento de escalamiento de privilegios por usuario ${userId}`,
      { userId, attemptedRole, currentRole, blocked: true },
      { userId, ipAddress }
    );
  }

  public logSuspiciousActivity(description: string, userId?: string, ipAddress?: string, details: Record<string, any> = {}): void {
    this.log(
      'SUSPICIOUS_ACTIVITY',
      'medium',
      `Actividad sospechosa detectada: ${description}`,
      details,
      { userId, ipAddress }
    );
  }

  public getRecentEvents(limit: number = 50): SecurityEvent[] {
    return this.logBuffer.slice(-limit);
  }

  public getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.logBuffer.filter(event => event.type === type);
  }

  public getEventsBySeverity(severity: SecurityEventSeverity): SecurityEvent[] {
    return this.logBuffer.filter(event => event.severity === severity);
  }
}

// Instancia singleton del logger
export const securityLogger = new SecurityLogger({
  enableConsoleLogging: true,
  enableFileLogging: process.env.NODE_ENV === 'production',
  enableDatabaseLogging: process.env.NODE_ENV === 'production',
  logLevel: process.env.NODE_ENV === 'production' ? 'medium' : 'low',
  includeSensitiveData: process.env.NODE_ENV !== 'production'
});

export default securityLogger;