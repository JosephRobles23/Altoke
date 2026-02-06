'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SendRemittanceSchema = z.object({
  toAccountId: z.string().min(1, 'Account ID del destinatario es requerido'),
  amount: z
    .number()
    .positive('El monto debe ser mayor a 0')
    .max(10000, 'Monto máximo es 10,000 USDC'),
  description: z.string().optional(),
});

export type TransactionActionResult = {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  fields?: Record<string, string[]>;
};

export async function sendRemittance(formData: FormData): Promise<TransactionActionResult> {
  const rawData = {
    toAccountId: formData.get('toAccountId'),
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description'),
  };

  const validatedFields = SendRemittanceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de transferencia inválidos',
      fields: validatedFields.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // TODO: Implementar con SendRemittance use case
    // 1. Validar balance suficiente
    // 2. Validar destinatario
    // 3. Crear transacción (pending)
    // 4. Ejecutar transferencia en Hedera
    // 5. Actualizar transacción (completed)
    // 6. Actualizar balances
    // 7. Enviar notificación

    revalidatePath('/dashboard');
    revalidatePath('/transactions');
    return {
      success: true,
      data: { transactionId: 'tx-placeholder' },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al enviar la remesa. Intenta de nuevo.',
    };
  }
}

export async function getTransactionHistory(
  userId: string
): Promise<TransactionActionResult> {
  try {
    // TODO: Implementar con GetTransactionHistory use case
    return {
      success: true,
      data: { transactions: [] },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al obtener el historial de transacciones.',
    };
  }
}

export async function getTransactionById(txId: string): Promise<TransactionActionResult> {
  const schema = z.string().uuid('ID de transacción inválido');
  const validatedId = schema.safeParse(txId);

  if (!validatedId.success) {
    return { success: false, error: 'ID de transacción inválido' };
  }

  try {
    // TODO: Implementar con repositorio de transacciones
    return {
      success: true,
      data: { transaction: null },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al obtener la transacción.',
    };
  }
}
