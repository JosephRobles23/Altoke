import { Transaction } from '@/lib/domain/entities/Transaction';

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string, limit?: number): Promise<Transaction[]>;
  findByTxHash(txHash: string): Promise<Transaction | null>;
  update(transaction: Transaction): Promise<void>;
}
