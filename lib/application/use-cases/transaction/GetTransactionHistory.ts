import { Transaction } from '@/lib/domain/entities/Transaction';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';

export interface GetTransactionHistoryRequest {
  userId: string;
  limit?: number;
}

export interface GetTransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
}

export class GetTransactionHistoryUseCase {
  constructor(private transactionRepo: ITransactionRepository) {}

  async execute(
    request: GetTransactionHistoryRequest
  ): Promise<GetTransactionHistoryResponse> {
    const transactions = await this.transactionRepo.findByUserId(
      request.userId,
      request.limit || 50
    );

    return {
      transactions,
      total: transactions.length,
    };
  }
}
