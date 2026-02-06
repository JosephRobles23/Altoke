interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate limiter simple en memoria
 * Para producción, usar Redis o similar
 */
export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60 * 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Verifica si una solicitud está permitida
   * @param key - Identificador único (IP, userId, etc.)
   * @returns true si la solicitud está permitida
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Obtiene el número de solicitudes restantes
   */
  getRemainingRequests(key: string): number {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  /**
   * Limpia entradas expiradas
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// Instancias pre-configuradas
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 intentos / 15 min
export const apiRateLimiter = new RateLimiter(30, 60 * 1000); // 30 requests / min
export const transactionRateLimiter = new RateLimiter(10, 60 * 1000); // 10 tx / min
