export interface TransakWebhookPayload {
  id: string;
  status: string;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  walletAddress: string;
  [key: string]: unknown;
}

export class ProcessWebhookUseCase {
  async execute(payload: TransakWebhookPayload): Promise<void> {
    // TODO: Implementar
    // 1. Buscar onramp_transaction por provider_order_id
    // 2. Actualizar estado
    // 3. Si completed:
    //    a. Asociar token si es primera vez
    //    b. Transferir USDC al usuario
    //    c. Actualizar balance del wallet
    // 4. Enviar notificación al usuario
  }
}
