import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendRemittanceUseCase } from '@/lib/application/use-cases/transaction/SendRemittance';
import { InsufficientFundsError } from '@/lib/shared/errors/AppError';

describe('SendRemittanceUseCase', () => {
  let useCase: SendRemittanceUseCase;
  let mockTransactionRepo: ReturnType<typeof createMockTransactionRepo>;
  let mockWalletRepo: ReturnType<typeof createMockWalletRepo>;
  let mockBlockchainClient: ReturnType<typeof createMockBlockchainClient>;
  let mockNotificationService: ReturnType<typeof createMockNotificationService>;
  let mockEncryptionService: ReturnType<typeof createMockEncryptionService>;

  function createMockTransactionRepo() {
    return {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByHederaTxId: vi.fn(),
      update: vi.fn(),
    };
  }

  function createMockWalletRepo() {
    return {
      findByUserId: vi.fn(),
      findByAccountId: vi.fn(),
      save: vi.fn(),
      updateBalance: vi.fn(),
    };
  }

  function createMockBlockchainClient() {
    return {
      sendTransaction: vi.fn(),
    };
  }

  function createMockNotificationService() {
    return {
      sendTransactionNotification: vi.fn(),
    };
  }

  function createMockEncryptionService() {
    return {
      decryptPrivateKey: vi.fn(),
    };
  }

  beforeEach(() => {
    mockTransactionRepo = createMockTransactionRepo();
    mockWalletRepo = createMockWalletRepo();
    mockBlockchainClient = createMockBlockchainClient();
    mockNotificationService = createMockNotificationService();
    mockEncryptionService = createMockEncryptionService();

    useCase = new SendRemittanceUseCase(
      mockTransactionRepo,
      mockWalletRepo,
      mockBlockchainClient,
      mockNotificationService,
      mockEncryptionService,
      'test-master-password',
      '0.0.12345'
    );
  });

  it('should send remittance successfully', async () => {
    const request = {
      fromUserId: 'user-1',
      toUserId: 'user-2',
      toAccountId: '0.0.99999',
      amount: { value: 50, currency: 'USDC' },
    };

    const mockWallet = {
      id: 'wallet-1',
      accountId: '0.0.11111',
      balance: { usdc: 100, hbar: 10 },
      privateKeyEncrypted: 'encrypted-key',
      hasEnoughBalance: () => true,
    };

    mockWalletRepo.findByUserId.mockResolvedValue(mockWallet);
    mockEncryptionService.decryptPrivateKey.mockReturnValue('decrypted-key');
    mockBlockchainClient.sendTransaction.mockResolvedValue('0xTxHash123');

    const result = await useCase.execute(request);

    expect(result.txHash).toBe('0xTxHash123');
    expect(mockTransactionRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTransactionRepo.update).toHaveBeenCalledTimes(1);
    expect(mockBlockchainClient.sendTransaction).toHaveBeenCalled();
    expect(mockNotificationService.sendTransactionNotification).toHaveBeenCalled();
  });

  it('should throw InsufficientFundsError when balance is low', async () => {
    const request = {
      fromUserId: 'user-1',
      toUserId: 'user-2',
      toAccountId: '0.0.99999',
      amount: { value: 150, currency: 'USDC' },
    };

    const mockWallet = {
      id: 'wallet-1',
      accountId: '0.0.11111',
      balance: { usdc: 100, hbar: 10 },
      privateKeyEncrypted: 'encrypted-key',
      hasEnoughBalance: () => false,
    };

    mockWalletRepo.findByUserId.mockResolvedValue(mockWallet);

    await expect(useCase.execute(request)).rejects.toThrow(InsufficientFundsError);
  });
});
