import { exchangeRateCache } from './cache';

export interface ExchangeRateData {
  from: string;
  to: string;
  rate: number;
  provider: string;
  timestamp: Date;
}

/**
 * Cliente para obtener tasas de cambio en tiempo real
 */
export class ExchangeRateClient {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    this.apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangerate-api.com/v4';
  }

  /**
   * Obtiene la tasa de cambio entre dos monedas
   * Primero verifica el cache, si no está, consulta la API
   */
  async getRate(from: string, to: string): Promise<number> {
    // 1. Verificar cache
    const cachedRate = exchangeRateCache.get(from, to);
    if (cachedRate !== null) {
      return cachedRate;
    }

    // 2. Consultar API
    try {
      const response = await fetch(`${this.apiUrl}/latest/${from}`);
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      const rate = data.rates?.[to];

      if (!rate) {
        throw new Error(`Rate not found for ${from} -> ${to}`);
      }

      // 3. Guardar en cache
      exchangeRateCache.set(from, to, rate);

      return rate;
    } catch (error) {
      // Fallback: retornar una tasa estática para desarrollo
      if (from === 'USD' && to === 'PEN') {
        return 3.72; // Tasa aproximada USD/PEN
      }
      throw error;
    }
  }
}

export const exchangeRateClient = new ExchangeRateClient();
