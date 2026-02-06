import {
  TransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
} from '@hashgraph/sdk';
import { getHederaClient } from './client';
import { BlockchainError } from '@/lib/shared/errors/AppError';

export interface TransferParams {
  from: string;
  to: string;
  amount: number;
  privateKey: string;
  tokenId: string;
}

/**
 * Servicio para operaciones de transacciones en Hedera
 */
export class HederaTransactionService {
  /**
   * Transfiere tokens HTS entre cuentas
   * @returns Transaction hash
   */
  async transferToken(params: TransferParams): Promise<string> {
    const client = getHederaClient().getSDKClient();

    try {
      const fromAccountId = AccountId.fromString(params.from);
      const toAccountId = AccountId.fromString(params.to);
      const tokenId = TokenId.fromString(params.tokenId);
      const senderKey = PrivateKey.fromStringDer(params.privateKey);

      // Convertir amount a la unidad más pequeña del token (asumimos 6 decimales para USDC)
      const amountInSmallestUnit = Math.round(params.amount * 1_000_000);

      const transaction = new TransferTransaction()
        .addTokenTransfer(tokenId, fromAccountId, -amountInSmallestUnit)
        .addTokenTransfer(tokenId, toAccountId, amountInSmallestUnit)
        .freezeWith(client);

      const signedTx = await transaction.sign(senderKey);
      const txResponse = await signedTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() !== 'SUCCESS') {
        throw new BlockchainError(
          `Transfer failed: ${receipt.status.toString()}`,
          txResponse.transactionId.toString()
        );
      }

      return txResponse.transactionId.toString();
    } catch (error) {
      if (error instanceof BlockchainError) throw error;

      throw new BlockchainError(
        `Token transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const hederaTransactionService = new HederaTransactionService();
