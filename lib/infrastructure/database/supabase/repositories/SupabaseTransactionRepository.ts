import { createClient } from '@/lib/infrastructure/database/supabase/server';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '@/lib/domain/entities/Transaction';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { DatabaseError } from '@/lib/shared/errors/AppError';

export class SupabaseTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    const supabase = createClient();
    const dbData = this.toDatabase(transaction);

    const { error } = await supabase.from('transactions').insert(dbData);

    if (error) throw new DatabaseError(error.message);
  }

  async findById(id: string): Promise<Transaction | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByUserId(
    userId: string,
    limit: number = 50
  ): Promise<Transaction[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new DatabaseError(error.message);
    return (data || []).map((row) => this.toDomain(row));
  }

  async findByTxHash(txHash: string): Promise<Transaction | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('tx_hash', txHash)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async update(transaction: Transaction): Promise<void> {
    const supabase = createClient();
    const dbData = this.toDatabase(transaction);

    const { error } = await supabase
      .from('transactions')
      .update(dbData)
      .eq('id', transaction.id);

    if (error) throw new DatabaseError(error.message);
  }

  private toDomain(data: Record<string, unknown>): Transaction {
    return new Transaction({
      id: data.id as string,
      fromUserId: data.from_user_id as string,
      toUserId: data.to_user_id as string | undefined,
      toAddress: data.to_address as string | undefined,
      type: data.type as TransactionType,
      status: data.status as TransactionStatus,
      amountUsdc: parseFloat(data.amount_usdc as string),
      amountPen: data.amount_pen
        ? parseFloat(data.amount_pen as string)
        : undefined,
      exchangeRate: data.exchange_rate
        ? parseFloat(data.exchange_rate as string)
        : undefined,
      feeUsdc: parseFloat((data.fee_usdc as string) || '0'),
      feePlatform: parseFloat((data.fee_platform as string) || '0'),
      txHash: data.tx_hash as string | undefined,
      blockNumber: data.block_number
        ? parseInt(data.block_number as string, 10)
        : undefined,
      gasUsed: data.gas_used
        ? parseInt(data.gas_used as string, 10)
        : undefined,
      description: data.description as string | undefined,
      metadata: data.metadata as Record<string, unknown> | undefined,
      errorMessage: data.error_message as string | undefined,
      createdAt: new Date(data.created_at as string),
      completedAt: data.completed_at
        ? new Date(data.completed_at as string)
        : undefined,
      updatedAt: new Date(data.updated_at as string),
    });
  }

  private toDatabase(transaction: Transaction): Record<string, unknown> {
    return {
      id: transaction.id,
      from_user_id: transaction.fromUserId,
      to_user_id: transaction.toUserId,
      to_address: transaction.toAddress,
      type: transaction.type,
      status: transaction.status,
      amount_usdc: transaction.amountUsdc,
      amount_pen: transaction.amountPen,
      exchange_rate: transaction.exchangeRate,
      fee_usdc: transaction.feeUsdc,
      fee_platform: transaction.feePlatform,
      tx_hash: transaction.txHash,
      block_number: transaction.blockNumber,
      gas_used: transaction.gasUsed,
      description: transaction.description,
      metadata: transaction.metadata,
      error_message: transaction.errorMessage,
      completed_at: transaction.completedAt?.toISOString(),
    };
  }
}
