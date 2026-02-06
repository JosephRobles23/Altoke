import {
  TokenAssociateTransaction,
  AccountId,
  PrivateKey,
  TokenId,
} from '@hashgraph/sdk';
import { getHederaClient } from './client';

/**
 * Servicio para operaciones con tokens HTS (Hedera Token Service)
 */
export class HederaTokenService {
  /**
   * Asocia un token a una cuenta (necesario antes de recibir tokens)
   */
  async associateToken(
    accountId: string,
    privateKey: string,
    tokenId: string
  ): Promise<void> {
    const client = getHederaClient().getSDKClient();

    const transaction = new TokenAssociateTransaction()
      .setAccountId(AccountId.fromString(accountId))
      .setTokenIds([TokenId.fromString(tokenId)])
      .freezeWith(client);

    const signedTx = await transaction.sign(PrivateKey.fromStringDer(privateKey));
    const txResponse = await signedTx.execute(client);
    const receipt = await txResponse.getReceipt(client);

    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Token association failed: ${receipt.status.toString()}`);
    }
  }

  /**
   * Verifica si un token ya está asociado a una cuenta
   */
  async isTokenAssociated(accountId: string, tokenId: string): Promise<boolean> {
    try {
      const hederaClient = getHederaClient();
      const balance = await hederaClient.getBalance(accountId);
      return tokenId in (balance.tokens || {});
    } catch {
      return false;
    }
  }
}

export const hederaTokenService = new HederaTokenService();
