import type { TransakConfig, TransakOrderData } from './types';

/**
 * Cliente para integración con Transak (On-Ramp)
 * Documentación: https://docs.transak.com
 */
export class TransakClient {
  private apiKey: string;
  private secretKey: string;
  private environment: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || '';
    this.secretKey = process.env.TRANSAK_SECRET_KEY || '';
    this.environment = process.env.TRANSAK_ENVIRONMENT || 'STAGING';
  }

  /**
   * Genera la configuración del widget de Transak para el frontend
   */
  getWidgetConfig(params: {
    walletAddress: string;
    fiatAmount?: number;
    fiatCurrency?: string;
    email?: string;
  }): TransakConfig {
    return {
      apiKey: this.apiKey,
      environment: this.environment,
      cryptoCurrencyCode: 'USDC',
      network: 'hedera',
      walletAddress: params.walletAddress,
      fiatAmount: params.fiatAmount || 100,
      fiatCurrency: params.fiatCurrency || 'USD',
      email: params.email,
      disableWalletAddressForm: true,
      themeColor: '3b82f6', // primary blue
    };
  }

  /**
   * Valida la firma de un webhook de Transak
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implementar validación HMAC con secretKey
    // const hmac = createHmac('sha256', this.secretKey);
    // const expectedSignature = hmac.update(payload).digest('hex');
    // return signature === expectedSignature;
    return true; // Placeholder para desarrollo
  }

  /**
   * Obtiene el estado de una orden
   */
  async getOrderStatus(orderId: string): Promise<TransakOrderData | null> {
    // TODO: Implementar llamada a la API de Transak
    return null;
  }
}

export const transakClient = new TransakClient();
