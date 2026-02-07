'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { walletService } from '@/lib/infrastructure/blockchain/base/wallet-service';
import { usdcService } from '@/lib/infrastructure/blockchain/base/usdc-service';
import { SupabaseWalletRepository } from '@/lib/infrastructure/database/supabase/repositories/SupabaseWalletRepository';
import { Wallet } from '@/lib/domain/entities/Wallet';

export type WalletActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

const walletRepo = new SupabaseWalletRepository();

export async function createWallet(): Promise<WalletActionResult> {
  try {
    // 1. Obtener usuario autenticado
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    // 2. Verificar si ya tiene wallet
    const existingWallet = await walletRepo.findByUserId(user.id);
    if (existingWallet) {
      return {
        success: false,
        error: 'Ya tienes un wallet creado',
      };
    }

    // 3. Generar wallet EVM con viem
    const masterPassword = process.env.ENCRYPTION_MASTER_PASSWORD!;
    const newWallet = walletService.createWallet(masterPassword);

    // 4. Guardar en base de datos
    const network = (process.env.NEXT_PUBLIC_BASE_NETWORK || 'base-sepolia') as
      | 'base-sepolia'
      | 'base';

    const wallet = Wallet.create({
      userId: user.id,
      address: newWallet.address,
      privateKeyEncrypted: newWallet.privateKeyEncrypted,
      balance: { eth: 0, usdc: 0 },
      network,
    });

    await walletRepo.save(wallet);

    revalidatePath('/dashboard');
    return {
      success: true,
      data: {
        address: newWallet.address,
        network,
      },
    };
  } catch (error) {
    console.error('Error creating wallet:', error);
    return {
      success: false,
      error: 'Error al crear el wallet. Intenta de nuevo.',
    };
  }
}

export async function getBalance(): Promise<WalletActionResult> {
  try {
    // 1. Obtener usuario autenticado
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    // 2. Obtener wallet del usuario
    const wallet = await walletRepo.findByUserId(user.id);
    if (!wallet) {
      return { success: false, error: 'No tienes un wallet creado' };
    }

    // 3. Consultar balances on-chain
    const address = wallet.address as `0x${string}`;
    const [ethBalance, usdcBalance] = await Promise.all([
      walletService.getETHBalance(address),
      usdcService.getBalance(address),
    ]);

    // 4. Actualizar en DB
    await walletRepo.updateBalance(wallet.id, {
      eth: ethBalance,
      usdc: usdcBalance,
    });

    return {
      success: true,
      data: {
        eth: ethBalance,
        usdc: usdcBalance,
        address: wallet.address,
        network: wallet.network,
      },
    };
  } catch (error) {
    console.error('Error getting balance:', error);
    return {
      success: false,
      error: 'Error al obtener el balance.',
    };
  }
}

/**
 * Obtiene el wallet del usuario autenticado (para server components)
 */
export async function getWallet(): Promise<WalletActionResult> {
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

    return {
      success: true,
      data: {
        id: wallet.id,
        address: wallet.address,
        eth: wallet.balance.eth,
        usdc: wallet.balance.usdc,
        network: wallet.network,
        isActive: wallet.isActive,
      },
    };
  } catch (error) {
    console.error('Error getting wallet:', error);
    return {
      success: false,
      error: 'Error al obtener el wallet.',
    };
  }
}
