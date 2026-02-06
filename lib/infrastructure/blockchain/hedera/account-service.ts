import { getHederaClient } from './client';
import type { HederaAccount, HederaBalance } from './types';

/**
 * Servicio para operaciones de cuentas en Hedera
 */
export class HederaAccountService {
  /**
   * Crea una nueva cuenta en Hedera Testnet
   */
  async createAccount(initialBalance?: number): Promise<HederaAccount> {
    const client = getHederaClient();
    return client.createAccount(initialBalance);
  }

  /**
   * Obtiene el balance de una cuenta
   */
  async getBalance(accountId: string): Promise<HederaBalance> {
    const client = getHederaClient();
    return client.getBalance(accountId);
  }
}

export const hederaAccountService = new HederaAccountService();
