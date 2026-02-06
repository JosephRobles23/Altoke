import { Transaction, TransactionType } from '@/lib/domain/entities/Transaction';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';
import { InsufficientFundsError, ValidationError } from '@/lib/shared/errors/AppError';

export interface IBlockchainClient {
  sendTransaction(params: {
    from: string;
    to: string;
    amount: number;
    privateKey: string;
    tokenId: string;
  }): Promise<string>;
}

export interface INotificationService {
  sendTransactionNotification(transaction: Transaction): Promise<void>;
}

export interface IEncryptionDecryptService {
  decryptPrivateKey(encryptedData: string, masterPassword: string): string;
}

export interface SendRemittanceRequest {
  fromUserId: string;
  toUserId?: string;
  toAccountId: string;
  amount: { value: number; currency: string };
  exchangeRate?: number;
  description?: string;
}

export interface SendRemittanceResponse {
  transactionId: string;
  txHash: string;
}

export class SendRemittanceUseCase {
  constructor(
    private transactionRepo: ITransactionRepository,
    private walletRepo: IWalletRepository,
    private blockchainClient: IBlockchainClient,
    private notificationService: INotificationService,
    private encryptionService: IEncryptionDecryptService,
    private masterPassword: string,
    private usdcTokenId: string
  ) {}

  async execute(request: SendRemittanceRequest): Promise<SendRemittanceResponse> {
    // 1. Validar que el usuario tenga fondos
    const wallet = await this.walletRepo.findByUserId(request.fromUserId);
    if (!wallet) {
      throw new ValidationError('Wallet not found');
    }

    if (!wallet.hasEnoughBalance(request.amount.value, 'usdc')) {
      throw new InsufficientFundsError();
    }

    if (!wallet.privateKeyEncrypted) {
      throw new ValidationError('Wallet private key not available');
    }

    // 2. Crear transacción en estado pending
    const transaction = Transaction.create({
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      toAccountId: request.toAccountId,
      amount: request.amount,
      type: TransactionType.Send,
      exchangeRate: request.exchangeRate,
      description: request.description,
    });
    await this.transactionRepo.save(transaction);

    try {
      // 3. Desencriptar private key
      const privateKey = this.encryptionService.decryptPrivateKey(
        wallet.privateKeyEncrypted,
        this.masterPassword
      );

      // 4. Ejecutar transferencia en blockchain
      const txHash = await this.blockchainClient.sendTransaction({
        from: wallet.accountId,
        to: request.toAccountId,
        amount: request.amount.value,
        privateKey,
        tokenId: this.usdcTokenId,
      });

      // 5. Actualizar transacción
      const completedTx = transaction.markAsCompleted(txHash);
      await this.transactionRepo.update(completedTx);

      // 6. Actualizar balances
      await this.walletRepo.updateBalance(wallet.id, {
        hbar: wallet.balance.hbar,
        usdc: wallet.balance.usdc - request.amount.value,
      });

      // 7. Notificar
      await this.notificationService.sendTransactionNotification(completedTx);

      return { transactionId: completedTx.id, txHash };
    } catch (error) {
      // Marcar como fallida
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const failedTx = transaction.markAsFailed(errorMessage);
      await this.transactionRepo.update(failedTx);
      throw error;
    }
  }
}
