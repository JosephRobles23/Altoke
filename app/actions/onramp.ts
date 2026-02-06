'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const InitiatePurchaseSchema = z.object({
  fiatAmount: z.number().positive('El monto debe ser mayor a 0'),
  fiatCurrency: z.string().default('USD'),
});

export type OnRampActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
};

export async function initiatePurchase(formData: FormData): Promise<OnRampActionResult> {
  const rawData = {
    fiatAmount: parseFloat(formData.get('fiatAmount') as string),
    fiatCurrency: formData.get('fiatCurrency') || 'USD',
  };

  const validatedFields = InitiatePurchaseSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de compra inválidos',
    };
  }

  try {
    // TODO: Implementar con InitiatePurchase use case
    // 1. Crear orden en onramp_transactions
    // 2. Retornar datos para widget de Transak

    return {
      success: true,
      data: { orderId: 'order-placeholder' },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al iniciar la compra.',
    };
  }
}

export async function getOnRampStatus(orderId: string): Promise<OnRampActionResult> {
  try {
    // TODO: Implementar consulta de estado de orden
    return {
      success: true,
      data: { status: 'pending' },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al consultar el estado de la orden.',
    };
  }
}
