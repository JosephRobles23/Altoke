/**
 * Use Case: Iniciar compra de USDC via TransFi On-Ramp
 *
 * Genera la URL del widget de TransFi para comprar crypto.
 * Ref: https://ramp-docs.transfi.com/docs/widget-integration
 */
export interface InitiatePurchaseRequest {
  userId: string;
  walletAddress: string;
  email: string;
  fiatAmount?: number;
  fiatCurrency?: string;
}

export interface InitiatePurchaseResponse {
  onrampURL: string;
}

export class InitiatePurchaseUseCase {
  async execute(
    request: InitiatePurchaseRequest
  ): Promise<InitiatePurchaseResponse> {
    const apiKey = process.env.TRANSFI_API_KEY;
    if (!apiKey) {
      throw new Error('TransFi API Key not configured');
    }

    const widgetBaseUrl =
      process.env.NEXT_PUBLIC_TRANSFI_WIDGET_URL ||
      'https://sandbox-buy.transfi.com';

    // Construir la URL del widget de TransFi On-Ramp
    const params = new URLSearchParams({
      apiKey,
      cryptoCurrency: 'USDC',
      network: 'base',
      walletAddress: request.walletAddress,
      email: request.email,
      product: 'buy',
    });

    if (request.fiatAmount) {
      params.set('fiatAmount', request.fiatAmount.toString());
    }
    if (request.fiatCurrency) {
      params.set('fiatCurrency', request.fiatCurrency);
    }

    const onrampURL = `${widgetBaseUrl}/?${params.toString()}`;

    return { onrampURL };
  }
}
