export interface InitiatePurchaseRequest {
  userId: string;
  walletAddress: string;
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
    const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;
    if (!projectId) {
      throw new Error('CDP Project ID not configured');
    }

    // Construir la URL del widget de Coinbase Onramp
    const params = new URLSearchParams({
      appId: projectId,
      destinationWallets: JSON.stringify([
        {
          address: request.walletAddress,
          blockchains: ['base'],
          assets: ['USDC'],
        },
      ]),
      defaultAsset: 'USDC',
      defaultNetwork: 'base',
      defaultPaymentMethod: 'CARD',
    });

    if (request.fiatAmount) {
      params.set('presetFiatAmount', request.fiatAmount.toString());
    }
    if (request.fiatCurrency) {
      params.set('fiatCurrency', request.fiatCurrency);
    }

    const onrampURL = `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;

    return { onrampURL };
  }
}
