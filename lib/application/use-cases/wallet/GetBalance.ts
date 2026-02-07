import { Balance } from '@/lib/domain/entities/Wallet';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';
import { ValidationError } from '@/lib/shared/errors/AppError';

export interface GetBalanceRequest {
  userId: string;
}

export interface GetBalanceResponse {
  address: string;
  balance: Balance;
}

export class GetBalanceUseCase {
  constructor(private walletRepo: IWalletRepository) {}

  async execute(request: GetBalanceRequest): Promise<GetBalanceResponse> {
    const wallet = await this.walletRepo.findByUserId(request.userId);

    if (!wallet) {
      throw new ValidationError('Wallet not found for user');
    }

    // TODO: Opcionalmente sincronizar con Base para obtener balance actualizado on-chain

    return {
      address: wallet.address,
      balance: wallet.balance,
    };
  }
}
