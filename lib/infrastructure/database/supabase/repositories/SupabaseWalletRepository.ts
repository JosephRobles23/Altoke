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

  async findByAccountId(accountId: string): Promise<Wallet | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('account_id', accountId)
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
        balance_hbar: balance.hbar,
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
      accountId: data.account_id as string,
      publicKey: data.public_key as string,
      privateKeyEncrypted: data.private_key_encrypted as string,
      balance: {
        hbar: parseFloat(data.balance_hbar as string),
        usdc: parseFloat(data.balance_usdc as string),
      },
      isActive: data.is_active as boolean,
      network: data.network as 'testnet' | 'mainnet',
      createdAt: new Date(data.created_at as string),
      updatedAt: new Date(data.updated_at as string),
    });
  }

  private toDatabase(wallet: Wallet): Record<string, unknown> {
    return {
      id: wallet.id,
      user_id: wallet.userId,
      account_id: wallet.accountId,
      public_key: wallet.publicKey,
      private_key_encrypted: wallet.privateKeyEncrypted,
      balance_hbar: wallet.balance.hbar,
      balance_usdc: wallet.balance.usdc,
      is_active: wallet.isActive,
      network: wallet.network,
    };
  }
}
