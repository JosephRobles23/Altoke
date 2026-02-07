export interface CoinbaseWebhookPayload {
  event: {
    type: string;
    data: {
      id?: string;
      transaction_id?: string;
      wallet_address?: string;
      crypto_amount?: string;
      fiat_amount?: string;
      fiat_currency?: string;
      status?: string;
      [key: string]: unknown;
    };
  };
}

export class ProcessWebhookUseCase {
  async execute(payload: CoinbaseWebhookPayload): Promise<void> {
    const { type, data } = payload.event;

    // TODO: Implementar
    // 1. Validar firma del webhook de Coinbase
    // 2. Buscar wallet por dirección
    // 3. Si onramp:completed:
    //    a. Registrar en onramp_transactions
    //    b. Actualizar balance USDC del wallet
    // 4. Si offramp:completed:
    //    a. Registrar en onramp_transactions
    // 5. Enviar notificación al usuario

    console.log(`Coinbase webhook processed: ${type}`, data);
  }
}
