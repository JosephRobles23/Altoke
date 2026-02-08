import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/infrastructure/database/supabase/server';

/**
 * Webhook Payload de TransFi
 * Referencia: https://docs.transfi.com/docs/onramp
 */
interface TransFiWebhookPayload {
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

/**
 * Webhook endpoint para TransFi
 * Recibe notificaciones cuando una orden de on-ramp/off-ramp cambia de estado.
 *
 * Eventos:
 * - initiated: Pago iniciado
 * - fund_settled: Pago autorizado por el banco
 * - fund_failed: Pago rechazado por el banco
 * - asset_settled: Crypto entregada al usuario
 * - asset_settle_failed: Error al entregar crypto
 * - expired: Orden expirada por inactividad
 */
export async function POST(request: NextRequest) {
  try {
    const body: TransFiWebhookPayload = await request.json();

    // Validar estructura básica del webhook
    if (!body.entityType || !body.status || !body.order) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Validar webhook secret si está configurado
    const webhookSecret = process.env.TRANSFI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-transfi-signature');
      if (!signature) {
        console.warn('[TransFi Webhook] Missing signature header');
        return NextResponse.json(
          { error: 'Missing signature' },
          { status: 401 }
        );
      }
      // TODO: Implementar validación HMAC de firma cuando TransFi lo documente
    }

    const supabase = createServiceClient();
    const { order, user: transfiUser, status } = body;

    console.log(
      `[TransFi Webhook] Event: ${status}, Order: ${order.orderId}, Type: ${order.type}`
    );

    switch (status) {
      // ── Pago iniciado ─────────────────────────────
      case 'initiated': {
        const walletAddress = order.walletAddress?.toLowerCase();

        if (walletAddress) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id, user_id')
            .eq('address', walletAddress)
            .single();

          if (wallet) {
            // Registrar transacción como pendiente
            await supabase.from('onramp_transactions').insert({
              user_id: wallet.user_id,
              wallet_id: wallet.id,
              provider: 'transfi',
              provider_tx_id: order.orderId,
              status: 'pending',
              type: order.type,
              fiat_amount: order.fiatAmount,
              fiat_currency: order.fiatTicker,
              crypto_amount: order.cryptoAmount,
              crypto_currency: order.cryptoTicker,
            });
          }
        }
        break;
      }

      // ── Pago autorizado (fiat recibido) ───────────
      case 'fund_settled': {
        await supabase
          .from('onramp_transactions')
          .update({
            status: 'fund_settled',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_tx_id', order.orderId)
          .eq('provider', 'transfi');

        console.log(
          `[TransFi Webhook] Fiat settled for order ${order.orderId}`
        );
        break;
      }

      // ── Crypto entregada exitosamente ─────────────
      case 'asset_settled': {
        const walletAddress = order.walletAddress?.toLowerCase();

        if (walletAddress) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id, user_id, balance_usdc')
            .eq('address', walletAddress)
            .single();

          if (wallet) {
            // Actualizar transacción como completada
            await supabase
              .from('onramp_transactions')
              .update({
                status: 'completed',
                crypto_amount: order.cryptoAmount,
                updated_at: new Date().toISOString(),
              })
              .eq('provider_tx_id', order.orderId)
              .eq('provider', 'transfi');

            // Si es compra (onramp), actualizar balance del wallet
            if (order.type === 'buy' && order.cryptoAmount) {
              const currentBalance = parseFloat(
                wallet.balance_usdc || '0'
              );

              await supabase
                .from('wallets')
                .update({
                  balance_usdc: currentBalance + order.cryptoAmount,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.id);
            }

            // Auto-upgrade KYC: si TransFi permitió la transacción,
            // el usuario pasó al menos el KYC básico de TransFi
            const { data: profile } = await supabase
              .from('profiles')
              .select('kyc_status, kyc_level')
              .eq('id', wallet.user_id)
              .single();

            if (
              profile &&
              profile.kyc_level === 0 &&
              profile.kyc_status === 'pending'
            ) {
              await supabase
                .from('profiles')
                .update({
                  kyc_status: 'approved',
                  kyc_level: 1,
                  kyc_data: {
                    transfi_user_id: transfiUser.userId,
                    verified_via: 'transfi_onramp',
                    verified_at: new Date().toISOString(),
                    provider: 'transfi',
                  },
                  updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.user_id);

              console.log(
                `[KYC] Auto-upgraded user ${wallet.user_id} to level 1 via TransFi`
              );
            }
          }
        }

        console.log(
          `[TransFi Webhook] Asset settled for order ${order.orderId}`
        );
        break;
      }

      // ── Pago fallido ──────────────────────────────
      case 'fund_failed': {
        await supabase
          .from('onramp_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_tx_id', order.orderId)
          .eq('provider', 'transfi');

        console.error(
          `[TransFi Webhook] Fund failed for order ${order.orderId}`
        );
        break;
      }

      // ── Entrega de crypto fallida ─────────────────
      case 'asset_settle_failed': {
        await supabase
          .from('onramp_transactions')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_tx_id', order.orderId)
          .eq('provider', 'transfi');

        console.error(
          `[TransFi Webhook] Asset settle failed for order ${order.orderId}`
        );
        break;
      }

      // ── Orden expirada ────────────────────────────
      case 'expired': {
        await supabase
          .from('onramp_transactions')
          .update({
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('provider_tx_id', order.orderId)
          .eq('provider', 'transfi');

        console.warn(
          `[TransFi Webhook] Order expired: ${order.orderId}`
        );
        break;
      }

      default:
        console.warn('[TransFi Webhook] Unhandled event status:', status);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[TransFi Webhook] Error processing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
