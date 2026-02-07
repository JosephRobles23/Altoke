'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { usdcService } from '@/lib/infrastructure/blockchain/base/usdc-service';
import { encryptionService } from '@/lib/infrastructure/security/encryption';
import { SupabaseWalletRepository } from '@/lib/infrastructure/database/supabase/repositories/SupabaseWalletRepository';
import { SupabaseTransactionRepository } from '@/lib/infrastructure/database/supabase/repositories/SupabaseTransactionRepository';
import { Transaction, TransactionType } from '@/lib/domain/entities/Transaction';
import { KYC_LEVELS } from '@/lib/shared/constants';

const SendRemittanceSchema = z.object({
  toAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Dirección EVM inválida'),
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

const walletRepo = new SupabaseWalletRepository();
const txRepo = new SupabaseTransactionRepository();

export async function sendRemittance(
  formData: FormData
): Promise<TransactionActionResult> {
  const rawData = {
    toAddress: formData.get('toAddress'),
    amount: parseFloat(formData.get('amount') as string),
    description: formData.get('description'),
  };

  const validatedFields = SendRemittanceSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de transferencia inválidos',
      fields: validatedFields.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

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

    // 2. Verificar KYC del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('kyc_status, kyc_level')
      .eq('id', user.id)
      .single();

    if (!profile || profile.kyc_level === 0) {
      return {
        success: false,
        error: 'Necesitas verificar tu identidad antes de enviar remesas. Compra USDC para verificarte.',
      };
    }

    const kycLevelInfo = KYC_LEVELS[profile.kyc_level as keyof typeof KYC_LEVELS];
    const maxTransfer = kycLevelInfo?.maxTransfer || 0;

    if (validatedFields.data.amount > maxTransfer) {
      return {
        success: false,
        error: `Tu nivel de verificación permite transferencias hasta $${maxTransfer.toLocaleString()} USD. Monto solicitado: $${validatedFields.data.amount.toLocaleString()} USD.`,
      };
    }

    // 3. Obtener wallet del remitente
    const senderWallet = await walletRepo.findByUserId(user.id);
    if (!senderWallet || !senderWallet.privateKeyEncrypted) {
      return { success: false, error: 'No tienes un wallet creado' };
    }

    const { toAddress, amount, description } = validatedFields.data;

    // 4. Validar balance suficiente
    const currentBalance = await usdcService.getBalance(
      senderWallet.address as `0x${string}`
    );
    if (currentBalance < amount) {
      return {
        success: false,
        error: `Balance insuficiente. Tienes ${currentBalance.toFixed(2)} USDC`,
      };
    }

    // 5. Crear transacción en estado pending
    const transaction = Transaction.create({
      fromUserId: user.id,
      toAddress,
      amount: { value: amount, currency: 'USDC' },
      type: TransactionType.Send,
      description,
    });

    await txRepo.save(transaction);

    // 6. Desencriptar private key y ejecutar transfer on-chain
    const masterPassword = process.env.ENCRYPTION_MASTER_PASSWORD!;
    const privateKey = encryptionService.decryptPrivateKey(
      senderWallet.privateKeyEncrypted,
      masterPassword
    ) as `0x${string}`;

    const result = await usdcService.transfer(
      privateKey,
      toAddress as `0x${string}`,
      amount
    );

    // 7. Marcar como completada con el tx hash
    const completedTx = transaction.markAsCompleted(
      result.txHash,
      Number(result.blockNumber),
      Number(result.gasUsed)
    );
    await txRepo.update(completedTx);

    // 8. Actualizar balance en DB
    const newBalance = await usdcService.getBalance(
      senderWallet.address as `0x${string}`
    );
    await walletRepo.updateBalance(senderWallet.id, {
      eth: senderWallet.balance.eth,
      usdc: newBalance,
    });

    revalidatePath('/dashboard');
    revalidatePath('/transactions');

    return {
      success: true,
      data: {
        transactionId: completedTx.id,
        txHash: result.txHash,
        explorerUrl: usdcService.getExplorerUrl(result.txHash),
      },
    };
  } catch (error) {
    console.error('Error sending remittance:', error);
    return {
      success: false,
      error: 'Error al enviar la remesa. Intenta de nuevo.',
    };
  }
}

export async function getTransactionHistory(): Promise<TransactionActionResult> {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'No autenticado' };
    }

    const transactions = await txRepo.findByUserId(user.id);

    return {
      success: true,
      data: {
        transactions: transactions.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amountUsdc,
          currency: 'USDC',
          status: tx.status,
          description: tx.description,
          txHash: tx.txHash,
          toAddress: tx.toAddress,
          createdAt: tx.createdAt.toISOString(),
          completedAt: tx.completedAt?.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return {
      success: false,
      error: 'Error al obtener el historial de transacciones.',
    };
  }
}

export async function getTransactionById(
  txId: string
): Promise<TransactionActionResult> {
  const schema = z.string().uuid('ID de transacción inválido');
  const validatedId = schema.safeParse(txId);

  if (!validatedId.success) {
    return { success: false, error: 'ID de transacción inválido' };
  }

  try {
    const transaction = await txRepo.findById(validatedId.data);

    if (!transaction) {
      return { success: false, error: 'Transacción no encontrada' };
    }

    return {
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amountUsdc,
          currency: 'USDC',
          status: transaction.status,
          description: transaction.description,
          txHash: transaction.txHash,
          blockNumber: transaction.blockNumber,
          gasUsed: transaction.gasUsed,
          toAddress: transaction.toAddress,
          createdAt: transaction.createdAt.toISOString(),
          completedAt: transaction.completedAt?.toISOString(),
        },
      },
    };
  } catch (error) {
    console.error('Error getting transaction:', error);
    return {
      success: false,
      error: 'Error al obtener la transacción.',
    };
  }
}
