import { Transaction } from '@/lib/domain/entities/Transaction';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';

/**
 * Application Service para operaciones de transacciones
 * Coordina entre use cases y repositorios
 */
export class TransactionAppService {
  constructor(private transactionRepo: ITransactionRepository) {}

  async getRecentTransactions(
    userId: string,
    limit: number = 10
  ): Promise<Transaction[]> {
    return this.transactionRepo.findByUserId(userId, limit);
  }

  async getTransactionDetails(
    transactionId: string
  ): Promise<Transaction | null> {
    return this.transactionRepo.findById(transactionId);
  }

  async getTransactionByTxHash(
    txHash: string
  ): Promise<Transaction | null> {
    return this.transactionRepo.findByTxHash(txHash);
  }
}
