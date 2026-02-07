import { Wallet, Balance } from '@/lib/domain/entities/Wallet';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';

/**
 * Application Service para operaciones de wallet
 */
export class WalletAppService {
  constructor(private walletRepo: IWalletRepository) {}

  async getWalletByUser(userId: string): Promise<Wallet | null> {
    return this.walletRepo.findByUserId(userId);
  }

  async getWalletByAddress(address: string): Promise<Wallet | null> {
    return this.walletRepo.findByAddress(address);
  }

  async updateBalance(walletId: string, balance: Balance): Promise<void> {
    return this.walletRepo.updateBalance(walletId, balance);
  }
}
