import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendRemittanceUseCase } from '@/lib/application/use-cases/transaction/SendRemittance';
import { InsufficientFundsError } from '@/lib/shared/errors/AppError';

describe('SendRemittanceUseCase', () => {
  let useCase: SendRemittanceUseCase;
  let mockTransactionRepo: ReturnType<typeof createMockTransactionRepo>;
  let mockWalletRepo: ReturnType<typeof createMockWalletRepo>;
  let mockBlockchainService: ReturnType<typeof createMockBlockchainService>;
  let mockNotificationService: ReturnType<
    typeof createMockNotificationService
  >;
  let mockEncryptionService: ReturnType<typeof createMockEncryptionService>;

  function createMockTransactionRepo() {
    return {
      save: vi.fn(),
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByTxHash: vi.fn(),
      update: vi.fn(),
    };
  }

  function createMockWalletRepo() {
    return {
      findByUserId: vi.fn(),
      findByAddress: vi.fn(),
      save: vi.fn(),
      updateBalance: vi.fn(),
    };
  }

  function createMockBlockchainService() {
    return {
      transfer: vi.fn(),
      getBalance: vi.fn(),
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
    mockBlockchainService = createMockBlockchainService();
    mockNotificationService = createMockNotificationService();
    mockEncryptionService = createMockEncryptionService();

    useCase = new SendRemittanceUseCase(
      mockTransactionRepo,
      mockWalletRepo,
      mockBlockchainService,
      mockNotificationService,
      mockEncryptionService,
      'test-master-password'
    );
  });

  it('should send remittance successfully', async () => {
    const request = {
      fromUserId: 'user-1',
      toUserId: 'user-2',
      toAddress: '0x1234567890abcdef1234567890abcdef12345678',
      amount: { value: 50, currency: 'USDC' },
    };

    const mockWallet = {
      id: 'wallet-1',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: { usdc: 100, eth: 0.01 },
      privateKeyEncrypted: 'encrypted-key',
      hasEnoughBalance: () => true,
    };

    mockWalletRepo.findByUserId.mockResolvedValue(mockWallet);
    mockEncryptionService.decryptPrivateKey.mockReturnValue('0xdecrypted-key');
    mockBlockchainService.transfer.mockResolvedValue({
      txHash: '0xTxHash123',
      blockNumber: BigInt(12345),
      gasUsed: BigInt(21000),
    });
    mockBlockchainService.getBalance.mockResolvedValue(50);

    const result = await useCase.execute(request);

    expect(result.txHash).toBe('0xTxHash123');
    expect(mockTransactionRepo.save).toHaveBeenCalledTimes(1);
    expect(mockTransactionRepo.update).toHaveBeenCalledTimes(1);
    expect(mockBlockchainService.transfer).toHaveBeenCalled();
    expect(
      mockNotificationService.sendTransactionNotification
    ).toHaveBeenCalled();
  });

  it('should throw InsufficientFundsError when balance is low', async () => {
    const request = {
      fromUserId: 'user-1',
      toUserId: 'user-2',
      toAddress: '0x1234567890abcdef1234567890abcdef12345678',
      amount: { value: 150, currency: 'USDC' },
    };

    const mockWallet = {
      id: 'wallet-1',
      address: '0xabcdef1234567890abcdef1234567890abcdef12',
      balance: { usdc: 100, eth: 0.01 },
      privateKeyEncrypted: 'encrypted-key',
      hasEnoughBalance: () => false,
    };

    mockWalletRepo.findByUserId.mockResolvedValue(mockWallet);

    await expect(useCase.execute(request)).rejects.toThrow(
      InsufficientFundsError
    );
  });
});
