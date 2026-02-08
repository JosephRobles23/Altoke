/**
 * Use Case: Procesar webhook de TransFi
 *
 * Maneja los eventos de webhook enviados por TransFi cuando una orden
 * de on-ramp/off-ramp cambia de estado.
 *
 * Eventos de TransFi:
 * - initiated: Pago iniciado
 * - fund_settled: Pago autorizado (fiat recibido)
 * - fund_failed: Pago rechazado por el banco
 * - asset_settled: Crypto entregada exitosamente
 * - asset_settle_failed: Error al entregar crypto
 * - expired: Orden expirada por inactividad
 *
 * Ref: https://docs.transfi.com/docs/onramp
 */

export interface TransFiWebhookPayload {
  orgId: string;
  entityId: string;
  entityType: 'order';
  status:
    | 'initiated'
    | 'fund_settled'
    | 'fund_failed'
    | 'asset_settled'
    | 'asset_settle_failed'
    | 'expired';
  user: {
    userId: string;
    firstName: string;
    lastName: string;
    country: string;
    createdAt: string;
  };
  order: {
    orderId: string;
    type: 'buy' | 'sell';
    fiatTicker: string;
    cryptoTicker: string;
    fiatAmount: number;
    cryptoAmount: number;
    walletAddress: string;
    paymentType: string | null;
    createdAt: string;
  };
  partnerContext: Record<string, unknown>;
}

export class ProcessWebhookUseCase {
  async execute(payload: TransFiWebhookPayload): Promise<void> {
    const { status, order, user } = payload;

    // La lógica principal está en el route handler (app/api/webhooks/transfi/route.ts)
    // Este use case actúa como interfaz del dominio para testing y extensibilidad

    switch (status) {
      case 'initiated':
        console.log(
          `[TransFi] Order ${order.orderId} initiated: ${order.type} ${order.fiatAmount} ${order.fiatTicker} → ${order.cryptoAmount} ${order.cryptoTicker}`
        );
        break;

      case 'fund_settled':
        console.log(
          `[TransFi] Fiat settled for order ${order.orderId}: ${order.fiatAmount} ${order.fiatTicker}`
        );
        break;

      case 'asset_settled':
        console.log(
          `[TransFi] Crypto delivered for order ${order.orderId}: ${order.cryptoAmount} ${order.cryptoTicker} → ${order.walletAddress}`
        );
        break;

      case 'fund_failed':
        console.error(
          `[TransFi] Payment failed for order ${order.orderId} by user ${user.userId}`
        );
        break;

      case 'asset_settle_failed':
        console.error(
          `[TransFi] Crypto delivery failed for order ${order.orderId}`
        );
        break;

      case 'expired':
        console.warn(
          `[TransFi] Order ${order.orderId} expired`
        );
        break;

      default:
        console.warn(`[TransFi] Unknown status: ${status}`);
    }
  }
}
