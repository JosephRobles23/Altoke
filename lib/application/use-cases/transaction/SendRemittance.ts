import {
  Transaction,
  TransactionType,
} from '@/lib/domain/entities/Transaction';
import { ITransactionRepository } from '@/lib/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/lib/domain/repositories/IWalletRepository';
import {
  InsufficientFundsError,
  ValidationError,
} from '@/lib/shared/errors/AppError';

export interface IBlockchainTransferService {
  transfer(
    fromPrivateKey: string,
    toAddress: string,
    amount: number
  ): Promise<{
    txHash: string;
    blockNumber: bigint;
    gasUsed: bigint;
  }>;
  getBalance(address: string): Promise<number>;
}

export interface IEncryptionDecryptService {
  decryptPrivateKey(encryptedData: string, masterPassword: string): string;
}

export interface INotificationService {
  sendTransactionNotification(transaction: Transaction): Promise<void>;
}

export interface SendRemittanceRequest {
  fromUserId: string;
  toUserId?: string;
  toAddress: string;
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
    private blockchainService: IBlockchainTransferService,
    private notificationService: INotificationService,
    private encryptionService: IEncryptionDecryptService,
    private masterPassword: string
  ) {}

  async execute(
    request: SendRemittanceRequest
  ): Promise<SendRemittanceResponse> {
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
      toAddress: request.toAddress,
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

      // 4. Ejecutar transferencia USDC en Base
      const result = await this.blockchainService.transfer(
        privateKey,
        request.toAddress,
        request.amount.value
      );

      // 5. Actualizar transacción
      const completedTx = transaction.markAsCompleted(
        result.txHash,
        Number(result.blockNumber),
        Number(result.gasUsed)
      );
      await this.transactionRepo.update(completedTx);

      // 6. Actualizar balances
      const newBalance = await this.blockchainService.getBalance(
        wallet.address
      );
      await this.walletRepo.updateBalance(wallet.id, {
        eth: wallet.balance.eth,
        usdc: newBalance,
      });

      // 7. Notificar
      await this.notificationService.sendTransactionNotification(completedTx);

      return { transactionId: completedTx.id, txHash: result.txHash };
    } catch (error) {
      // Marcar como fallida
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const failedTx = transaction.markAsFailed(errorMessage);
      await this.transactionRepo.update(failedTx);
      throw error;
    }
  }
}
