import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/infrastructure/database/supabase/server';

/**
 * Webhook endpoint para Coinbase CDP
 * Recibe notificaciones cuando una orden de on-ramp/off-ramp cambia de estado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificar que el webhook venga de Coinbase
    // En producción, validar con el header de firma
    const eventType = body.event?.type;
    const eventData = body.event?.data;

    if (!eventType || !eventData) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    switch (eventType) {
      case 'charge:confirmed':
      case 'onramp:completed': {
        // Actualizar la transacción de on-ramp como completada
        const walletAddress = eventData.wallet_address?.toLowerCase();
        const cryptoAmount = eventData.crypto_amount;
        const fiatAmount = eventData.fiat_amount;
        const fiatCurrency = eventData.fiat_currency || 'USD';

        if (walletAddress) {
          // Buscar la transacción pendiente por dirección del wallet
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id, user_id')
            .eq('address', walletAddress)
            .single();

          if (wallet) {
            // Registrar la transacción de onramp
            await supabase.from('onramp_transactions').insert({
              user_id: wallet.user_id,
              wallet_id: wallet.id,
              provider: 'coinbase',
              status: 'completed',
              fiat_amount: fiatAmount,
              fiat_currency: fiatCurrency,
              crypto_amount: cryptoAmount,
              crypto_currency: 'USDC',
              provider_tx_id: eventData.id || eventData.transaction_id,
            });

            // Actualizar balance del wallet
            if (cryptoAmount) {
              const { data: currentWallet } = await supabase
                .from('wallets')
                .select('balance_usdc')
                .eq('id', wallet.id)
                .single();

              const currentBalance = parseFloat(
                currentWallet?.balance_usdc || '0'
              );

              await supabase
                .from('wallets')
                .update({
                  balance_usdc: currentBalance + parseFloat(cryptoAmount),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.id);
            }

            // Auto-upgrade KYC: si Coinbase permitió la compra, el usuario
            // pasó la verificación de identidad de Coinbase
            const { data: profile } = await supabase
              .from('profiles')
              .select('kyc_status, kyc_level')
              .eq('id', wallet.user_id)
              .single();

            if (profile && profile.kyc_level === 0 && profile.kyc_status === 'pending') {
              await supabase
                .from('profiles')
                .update({
                  kyc_status: 'approved',
                  kyc_level: 1,
                  kyc_data: {
                    verified_via: 'coinbase_onramp',
                    verified_at: new Date().toISOString(),
                  },
                  updated_at: new Date().toISOString(),
                })
                .eq('id', wallet.user_id);

              console.log(`[KYC] Auto-upgraded user ${wallet.user_id} to level 1 via Coinbase onramp`);
            }
          }
        }
        break;
      }

      case 'offramp:completed': {
        const walletAddress = eventData.wallet_address?.toLowerCase();
        const cryptoAmount = eventData.crypto_amount;
        const fiatAmount = eventData.fiat_amount;

        if (walletAddress) {
          const { data: wallet } = await supabase
            .from('wallets')
            .select('id, user_id')
            .eq('address', walletAddress)
            .single();

          if (wallet) {
            await supabase.from('onramp_transactions').insert({
              user_id: wallet.user_id,
              wallet_id: wallet.id,
              provider: 'coinbase',
              status: 'completed',
              fiat_amount: fiatAmount,
              fiat_currency: 'USD',
              crypto_amount: cryptoAmount,
              crypto_currency: 'USDC',
              provider_tx_id: eventData.id || eventData.transaction_id,
            });
          }
        }
        break;
      }

      case 'charge:failed':
      case 'onramp:failed':
      case 'offramp:failed': {
        console.error('Coinbase transaction failed:', eventData);
        break;
      }

      default:
        console.warn('Unhandled Coinbase webhook event:', eventType);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing Coinbase webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
