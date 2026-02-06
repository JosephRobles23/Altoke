import {
  Client,
  AccountId,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
} from '@hashgraph/sdk';
import { env } from '@/lib/config/env';
import type { HederaAccount, HederaBalance } from './types';

/**
 * Cliente principal de Hedera Hashgraph
 * Maneja la conexión y operaciones básicas con la red
 */
export class HederaClient {
  private client: Client;

  constructor() {
    if (env.HEDERA_NETWORK === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(
      AccountId.fromString(env.HEDERA_OPERATOR_ID),
      PrivateKey.fromStringDer(env.HEDERA_OPERATOR_KEY)
    );
  }

  /**
   * Crea una nueva cuenta en Hedera
   * @param initialBalance Balance inicial en HBAR (default: 10 para testnet)
   */
  async createAccount(initialBalance: number = 10): Promise<HederaAccount> {
    const newPrivateKey = PrivateKey.generateED25519();
    const newPublicKey = newPrivateKey.publicKey;

    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(initialBalance));

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    const newAccountId = receipt.accountId;
    if (!newAccountId) {
      throw new Error('Failed to create Hedera account: no account ID returned');
    }

    return {
      accountId: newAccountId.toString(),
      publicKey: newPublicKey.toStringDer(),
      privateKey: newPrivateKey.toStringDer(),
    };
  }

  /**
   * Obtiene el balance de una cuenta
   */
  async getBalance(accountId: string): Promise<HederaBalance> {
    const balance = await new AccountBalanceQuery()
      .setAccountId(AccountId.fromString(accountId))
      .execute(this.client);

    return {
      hbar: balance.hbars.toBigNumber().toNumber(),
      tokens: Object.fromEntries(
        Array.from(balance.tokens?._map?.entries() || []).map(([k, v]) => [
          k.toString(),
          v.toNumber(),
        ])
      ),
    };
  }

  /**
   * Obtiene el cliente SDK para operaciones avanzadas
   */
  getSDKClient(): Client {
    return this.client;
  }

  /**
   * Cierra la conexión con Hedera
   */
  close(): void {
    this.client.close();
  }
}

// Singleton instance
let hederaClientInstance: HederaClient | null = null;

export function getHederaClient(): HederaClient {
  if (!hederaClientInstance) {
    hederaClientInstance = new HederaClient();
  }
  return hederaClientInstance;
}
