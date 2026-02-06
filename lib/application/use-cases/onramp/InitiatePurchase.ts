export interface InitiatePurchaseRequest {
  userId: string;
  fiatAmount: number;
  fiatCurrency: string;
}

export interface InitiatePurchaseResponse {
  orderId: string;
  transakWidgetConfig: Record<string, unknown>;
}

export class InitiatePurchaseUseCase {
  async execute(request: InitiatePurchaseRequest): Promise<InitiatePurchaseResponse> {
    // TODO: Implementar
    // 1. Crear registro en onramp_transactions
    // 2. Generar configuración para widget de Transak
    // 3. Retornar datos para el frontend

    return {
      orderId: crypto.randomUUID(),
      transakWidgetConfig: {
        apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY,
        environment: process.env.TRANSAK_ENVIRONMENT || 'STAGING',
        fiatAmount: request.fiatAmount,
        fiatCurrency: request.fiatCurrency,
        cryptoCurrencyCode: 'USDC',
        network: 'hedera',
      },
    };
  }
}
