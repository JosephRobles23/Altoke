interface CacheEntry {
  rate: number;
  expiresAt: number;
}

/**
 * Cache en memoria para tasas de cambio
 * TTL default: 5 minutos
 */
export class ExchangeRateCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) {
    this.ttl = ttlMs;
  }

  private getKey(from: string, to: string): string {
    return `${from}:${to}`;
  }

  get(from: string, to: string): number | null {
    const key = this.getKey(from, to);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.rate;
  }

  set(from: string, to: string, rate: number): void {
    const key = this.getKey(from, to);
    this.cache.set(key, {
      rate,
      expiresAt: Date.now() + this.ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const exchangeRateCache = new ExchangeRateCache();
