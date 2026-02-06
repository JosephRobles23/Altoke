'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export type WalletActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

export async function createWallet(): Promise<WalletActionResult> {
  try {
    // TODO: Implementar con CreateWallet use case
    // 1. Obtener usuario autenticado
    // 2. Generar cuenta Hedera
    // 3. Encriptar private key
    // 4. Guardar en base de datos

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Error al crear el wallet. Intenta de nuevo.',
    };
  }
}

export async function getBalance(walletId: string): Promise<WalletActionResult> {
  const schema = z.string().uuid('ID de wallet inválido');
  const validatedId = schema.safeParse(walletId);

  if (!validatedId.success) {
    return { success: false, error: 'ID de wallet inválido' };
  }

  try {
    // TODO: Implementar con GetBalance use case
    // 1. Obtener wallet de la base de datos
    // 2. Opcionalmente sincronizar con Hedera
    // 3. Retornar balances

    return {
      success: true,
      data: {
        hbar: 0,
        usdc: 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al obtener el balance.',
    };
  }
}

export async function associateToken(
  walletId: string,
  tokenId: string
): Promise<WalletActionResult> {
  try {
    // TODO: Implementar con AssociateToken use case
    // 1. Obtener wallet
    // 2. Desencriptar private key
    // 3. Asociar token en Hedera
    // 4. Actualizar base de datos

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Error al asociar el token.',
    };
  }
}
