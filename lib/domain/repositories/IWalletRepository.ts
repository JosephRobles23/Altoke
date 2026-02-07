import { Wallet, Balance } from '@/lib/domain/entities/Wallet';

export interface IWalletRepository {
  findByUserId(userId: string): Promise<Wallet | null>;
  findByAddress(address: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
  updateBalance(walletId: string, balance: Balance): Promise<void>;
}
