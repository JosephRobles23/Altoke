import { createClient } from '@/lib/infrastructure/database/supabase/server';
import { Wallet, Balance } from '@/lib/domain/entities/Wallet';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';
import { DatabaseError } from '@/lib/shared/errors/AppError';

export class SupabaseWalletRepository implements IWalletRepository {
  async findByUserId(userId: string): Promise<Wallet | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async findByAddress(address: string): Promise<Wallet | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('address', address.toLowerCase())
      .single();

    if (error || !data) return null;
    return this.toDomain(data);
  }

  async save(wallet: Wallet): Promise<void> {
    const supabase = createClient();
    const dbData = this.toDatabase(wallet);

    const { error } = await supabase.from('wallets').upsert(dbData);

    if (error) throw new DatabaseError(error.message);
  }

  async updateBalance(walletId: string, balance: Balance): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('wallets')
      .update({
        balance_eth: balance.eth,
        balance_usdc: balance.usdc,
        updated_at: new Date().toISOString(),
      })
      .eq('id', walletId);

    if (error) throw new DatabaseError(error.message);
  }

  private toDomain(data: Record<string, unknown>): Wallet {
    return new Wallet({
      id: data.id as string,
      userId: data.user_id as string,
      address: data.address as string,
      privateKeyEncrypted: data.private_key_encrypted as string,
      balance: {
        eth: parseFloat((data.balance_eth as string) || '0'),
        usdc: parseFloat((data.balance_usdc as string) || '0'),
      },
      isActive: data.is_active as boolean,
      network: data.network as 'base-sepolia' | 'base',
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });
  }

  private toDatabase(wallet: Wallet): Record<string, unknown> {
    return {
      id: wallet.id,
      user_id: wallet.userId,
      address: wallet.address.toLowerCase(),
      private_key_encrypted: wallet.privateKeyEncrypted,
      balance_eth: wallet.balance.eth,
      balance_usdc: wallet.balance.usdc,
      is_active: wallet.isActive,
      network: wallet.network,
    };
  }
}
