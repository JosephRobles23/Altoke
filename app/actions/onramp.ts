'use server';

import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { SupabaseWalletRepository } from '@/lib/infrastructure/database/supabase/repositories/SupabaseWalletRepository';

export type OnRampActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

const walletRepo = new SupabaseWalletRepository();

// ============================================
// TransFi — Autenticación y configuración
// https://docs.transfi.com
// ============================================

/**
 * URL del widget de TransFi (Ramp).
 *
 * IMPORTANTE: TransFi tiene dos sistemas de API:
 * 1. Ramp Widget (sandbox-buy.transfi.com) — usa pk_sandbox/sk_sandbox
 * 2. Single Integrated API (sandbox-api.transfi.com) — usa credenciales separadas
 *
 * Las credenciales pk_sandbox/sk_sandbox del Ramp Dashboard son para el WIDGET,
 * no para la Single Integrated API. El widget maneja KYC internamente (via Sumsub),
 * así que no necesitamos llamar directamente a /v2/kyc/standard ni /v2/users/individual.
 */
function getTransFiWidgetUrl(): string {
  return (
    process.env.NEXT_PUBLIC_TRANSFI_WIDGET_URL ||
    'https://sandbox-buy.transfi.com'
  );
}

// ============================================
// TransFi — Iniciar KYC via Widget
// El widget de TransFi maneja KYC internamente (via Sumsub).
// Cuando el usuario intenta comprar por primera vez, el widget
// le solicita completar KYC antes de procesar el pago.
// ============================================

/**
 * Genera la URL del widget de TransFi configurada para iniciar
 * el flujo de verificación KYC.
 *
 * El widget de TransFi maneja automáticamente:
 * 1. Creación del usuario en TransFi
 * 2. Verificación KYC vía Sumsub (ID, selfie, dirección)
 * 3. Procesamiento del pago (si el usuario quiere comprar)
 *
 * Al abrir el widget, si el usuario no tiene KYC, TransFi
 * lo guiará por el proceso de verificación antes de permitir
 * cualquier transacción.
 */
export async function initiateTransFiKYC(): Promise<OnRampActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const wallet = await walletRepo.findByUserId(user.id);
    if (!wallet) {
      return { success: false, error: 'No tienes un wallet creado. Crea tu wallet primero.' };
    }

    // Obtener datos del perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status === 'approved') {
      return { success: false, error: 'Tu KYC ya fue aprobado.' };
    }

    const apiKey = process.env.TRANSFI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'TransFi API Key no configurada' };
    }

    // El widget de TransFi maneja KYC internamente.
    // Al abrir el widget, si el usuario no tiene KYC completado,
    // TransFi le mostrará el flujo de verificación vía Sumsub.
    const params = new URLSearchParams({
      apiKey,
      cryptoCurrency: 'USDC',
      network: 'base',
      walletAddress: wallet.address,
      email: user.email || '',
      product: 'buy',
    });

    const widgetUrl = `${getTransFiWidgetUrl()}/?${params.toString()}`;

    // Marcar como en revisión en nuestro sistema
    await supabase
      .from('profiles')
      .update({
        kyc_status: 'in_review',
        kyc_data: {
          provider: 'transfi',
          kyc_initiated_at: new Date().toISOString(),
          method: 'widget',
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    return {
      success: true,
      data: {
        kycUrl: widgetUrl,
      },
    };
  } catch (error) {
    console.error('[TransFi] Error initiating KYC:', error);
    return {
      success: false,
      error: 'Error al iniciar la verificación KYC.',
    };
  }
}

// ============================================
// TransFi — Widget On-Ramp URL
// https://ramp-docs.transfi.com/docs/widget-integration
// ============================================

/**
 * Genera la URL del widget de On-Ramp de TransFi
 * para comprar USDC directamente en Base.
 *
 * El widget se integra vía iframe o redirect y maneja:
 * - Selección de método de pago (40+ monedas fiat, 250+ métodos)
 * - Procesamiento del pago
 * - Liquidación de crypto al wallet del usuario
 */
export async function generateOnrampURL(): Promise<OnRampActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const wallet = await walletRepo.findByUserId(user.id);
    if (!wallet) {
      return { success: false, error: 'No tienes un wallet creado' };
    }

    const widgetBaseUrl =
      process.env.NEXT_PUBLIC_TRANSFI_WIDGET_URL ||
      'https://sandbox-buy.transfi.com';

    const apiKey = process.env.TRANSFI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'TransFi API Key no configurada' };
    }

    // Construir URL del widget con parámetros
    const params = new URLSearchParams({
      apiKey,
      cryptoCurrency: 'USDC',
      network: 'base',
      walletAddress: wallet.address,
      email: user.email || '',
      product: 'buy',
    });

    const onrampURL = `${widgetBaseUrl}/?${params.toString()}`;

    return {
      success: true,
      data: {
        url: onrampURL,
        address: wallet.address,
      },
    };
  } catch (error) {
    console.error('[TransFi Onramp] Error generating URL:', error);
    return {
      success: false,
      error: 'Error al generar la URL de compra.',
    };
  }
}

// ============================================
// TransFi — Widget Off-Ramp URL
// https://ramp-docs.transfi.com/docs/widget-integration
// ============================================

/**
 * Genera la URL del widget de Off-Ramp de TransFi
 * para vender USDC y recibir fiat (PEN/USD).
 */
export async function generateOfframpURL(): Promise<OnRampActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const wallet = await walletRepo.findByUserId(user.id);
    if (!wallet) {
      return { success: false, error: 'No tienes un wallet creado' };
    }

    const widgetBaseUrl =
      process.env.NEXT_PUBLIC_TRANSFI_WIDGET_URL ||
      'https://sandbox-buy.transfi.com';

    const apiKey = process.env.TRANSFI_API_KEY;
    if (!apiKey) {
      return { success: false, error: 'TransFi API Key no configurada' };
    }

    // Construir URL del widget para offramp (sell)
    const params = new URLSearchParams({
      apiKey,
      cryptoCurrency: 'USDC',
      network: 'base',
      walletAddress: wallet.address,
      email: user.email || '',
      product: 'sell',
    });

    const offrampURL = `${widgetBaseUrl}/?${params.toString()}`;

    return {
      success: true,
      data: {
        url: offrampURL,
        address: wallet.address,
      },
    };
  } catch (error) {
    console.error('[TransFi Offramp] Error generating URL:', error);
    return {
      success: false,
      error: 'Error al generar la URL de venta.',
    };
  }
}

// ============================================
// Status — Consultar estado de orden
// ============================================

/**
 * Consulta el estado de una orden de on/off-ramp en la DB local.
 */
export async function getOnRampStatus(
  orderId: string
): Promise<OnRampActionResult> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('onramp_transactions')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      return { success: false, error: 'Orden no encontrada' };
    }

    return {
      success: true,
      data: {
        id: data.id,
        status: data.status,
        fiatAmount: data.fiat_amount,
        fiatCurrency: data.fiat_currency,
        cryptoAmount: data.crypto_amount,
        provider: data.provider,
        createdAt: data.created_at,
      },
    };
  } catch (error) {
    console.error('[TransFi] Error getting status:', error);
    return {
      success: false,
      error: 'Error al consultar el estado de la orden.',
    };
  }
}
