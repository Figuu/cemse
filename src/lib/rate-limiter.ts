/**
 * Rate Limiting para prevenir ataques de fuerza bruta
 * OWASP Top 10 - A04: Diseño Inseguro
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    windowStart: number;
    blockedUntil?: number;
  }
}

class RateLimiter {
  private store: RateLimitStore = {};
  private windowMs: number;
  private maxRequests: number;
  private blockDurationMs: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 5, blockDurationMs: number = 15 * 60 * 1000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.blockDurationMs = blockDurationMs;
  }

  private getKey(identifier: string, action: string = 'default'): string {
    return `${identifier}:${action}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      const entry = this.store[key];
      // Limpiar entradas expiradas
      if (entry.windowStart + this.windowMs < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
        delete this.store[key];
      }
    });
  }

  public isBlocked(identifier: string, action: string = 'default'): boolean {
    const key = this.getKey(identifier, action);
    const entry = this.store[key];

    if (!entry) return false;

    const now = Date.now();
    return entry.blockedUntil ? entry.blockedUntil > now : false;
  }

  public getRemainingTime(identifier: string, action: string = 'default'): number {
    const key = this.getKey(identifier, action);
    const entry = this.store[key];

    if (!entry || !entry.blockedUntil) return 0;

    const remainingTime = entry.blockedUntil - Date.now();
    return Math.max(0, Math.ceil(remainingTime / 1000)); // retorna en segundos
  }

  public attempt(identifier: string, action: string = 'default'): {
    allowed: boolean;
    remainingAttempts?: number;
    retryAfter?: number;
    blocked?: boolean;
  } {
    this.cleanupExpiredEntries();

    const key = this.getKey(identifier, action);
    const now = Date.now();

    // Verificar si está bloqueado
    if (this.isBlocked(identifier, action)) {
      return {
        allowed: false,
        blocked: true,
        retryAfter: this.getRemainingTime(identifier, action)
      };
    }

    let entry = this.store[key];

    // Crear nueva entrada o resetear si la ventana expiró
    if (!entry || entry.windowStart + this.windowMs < now) {
      entry = {
        count: 0,
        windowStart: now
      };
    }

    entry.count++;

    // Si excede el límite, bloquear
    if (entry.count > this.maxRequests) {
      entry.blockedUntil = now + this.blockDurationMs;
      this.store[key] = entry;

      // Log de evento de seguridad
      console.warn(`Rate limit exceeded for ${identifier}:${action}`, {
        timestamp: new Date().toISOString(),
        identifier,
        action,
        attempts: entry.count,
        blocked: true
      });

      return {
        allowed: false,
        blocked: true,
        retryAfter: this.blockDurationMs / 1000
      };
    }

    this.store[key] = entry;

    return {
      allowed: true,
      remainingAttempts: this.maxRequests - entry.count
    };
  }

  public reset(identifier: string, action: string = 'default'): void {
    const key = this.getKey(identifier, action);
    delete this.store[key];
  }
}

// Configuraciones específicas para diferentes acciones
export const loginRateLimiter = new RateLimiter(
  15 * 60 * 1000, // 15 minutos
  5, // 5 intentos
  30 * 60 * 1000 // bloqueo de 30 minutos
);

export const apiRateLimiter = new RateLimiter(
  60 * 1000, // 1 minuto
  100, // 100 requests
  5 * 60 * 1000 // bloqueo de 5 minutos
);

export const passwordResetRateLimiter = new RateLimiter(
  60 * 60 * 1000, // 1 hora
  3, // 3 intentos
  60 * 60 * 1000 // bloqueo de 1 hora
);

export { RateLimiter };