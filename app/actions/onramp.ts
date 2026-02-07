'use server';

import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { SupabaseWalletRepository } from '@/lib/infrastructure/database/supabase/repositories/SupabaseWalletRepository';
import { generateJwt } from '@coinbase/cdp-sdk/auth';

export type OnRampActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

const walletRepo = new SupabaseWalletRepository();

// ============================================
// Session Token — requerido por Coinbase Onramp/Offramp
// https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/generating-onramp-url#getting-a-session-token
// ============================================

/**
 * Genera un session token de Coinbase CDP para inicializar
 * el widget de Onramp/Offramp de forma segura.
 *
 * Flujo:
 * 1. Genera JWT con las credenciales CDP (server-side)
 * 2. Llama al Session Token API con addresses + assets
 * 3. Retorna el token de un solo uso
 */
async function generateSessionToken(
  walletAddress: string,
  assets: string[] = ['USDC']
): Promise<string> {
  const apiKeyId = process.env.CDP_API_KEY_NAME;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;

  if (!apiKeyId || !apiKeySecret) {
    throw new Error('CDP API Key no configurada');
  }

  // 1. Generar JWT firmado con las credenciales CDP
  const jwt = await generateJwt({
    apiKeyId,
    apiKeySecret,
    requestMethod: 'POST',
    requestHost: 'api.developer.coinbase.com',
    requestPath: '/onramp/v1/token',
    expiresIn: 120,
  });

  // 2. Llamar al Session Token API
  const response = await fetch(
    'https://api.developer.coinbase.com/onramp/v1/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        addresses: [
          {
            address: walletAddress,
            blockchains: ['base'],
          },
        ],
        assets,
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[CDP] Session Token API error:', response.status, errorBody);
    throw new Error(`Error obteniendo session token: ${response.status}`);
  }

  const data = await response.json();
  return data.token;
}

// ============================================
// Onramp — Comprar USDC
// https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/generating-onramp-url
// ============================================

/**
 * Genera la URL del widget de On-Ramp de Coinbase CDP
 * para comprar USDC directamente en Base.
 * Usa session token (requerido desde 07/2025).
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

    // Generar session token (un solo uso, expira rápidamente)
    const sessionToken = await generateSessionToken(wallet.address, ['USDC']);

    // Construir URL con session token + parámetros opcionales
    const params = new URLSearchParams({
      sessionToken,
      defaultAsset: 'USDC',
      defaultNetwork: 'base',
      defaultPaymentMethod: 'CARD',
      defaultExperience: 'buy',
    });

    const onrampURL = `https://pay.coinbase.com/buy/select-asset?${params.toString()}`;

    return {
      success: true,
      data: {
        url: onrampURL,
        address: wallet.address,
      },
    };
  } catch (error) {
    console.error('[Onramp] Error generating URL:', error);
    return {
      success: false,
      error: 'Error al generar la URL de compra.',
    };
  }
}

// ============================================
// Offramp — Vender USDC
// https://docs.cdp.coinbase.com/onramp-&-offramp/offramp-apis/generating-offramp-url
// ============================================

/**
 * Genera la URL del widget de Off-Ramp de Coinbase CDP
 * para vender USDC y recibir USD.
 * Usa session token (requerido desde 07/2025).
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

    // Generar session token
    const sessionToken = await generateSessionToken(wallet.address, ['USDC']);

    // Construir URL del Offramp con parámetros requeridos
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const params = new URLSearchParams({
      sessionToken,
      partnerUserRef: user.id,
      redirectUrl: `${appUrl}/dashboard`,
      defaultAsset: 'USDC',
      defaultNetwork: 'base',
    });

    const offrampURL = `https://pay.coinbase.com/v3/sell/input?${params.toString()}`;

    return {
      success: true,
      data: {
        url: offrampURL,
        address: wallet.address,
      },
    };
  } catch (error) {
    console.error('[Offramp] Error generating URL:', error);
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
 * Consulta el estado de una orden de on/off-ramp
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
    console.error('[Onramp] Error getting status:', error);
    return {
      success: false,
      error: 'Error al consultar el estado de la orden.',
    };
  }
}
