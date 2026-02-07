import { describe, it, expect } from 'vitest';
import {
  Transaction,
  TransactionStatus,
} from '@/lib/domain/entities/Transaction';

describe('Transaction Entity', () => {
  it('should create a pending transaction', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
    });

    expect(tx.status).toBe(TransactionStatus.Pending);
    expect(tx.amountUsdc).toBe(100);
    expect(tx.fromUserId).toBe('user-1');
    expect(tx.toUserId).toBe('user-2');
    expect(tx.id).toBeDefined();
  });

  it('should mark transaction as completed', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
    });

    const completedTx = tx.markAsCompleted('0xTxHash123', 12345, 21000);

    expect(completedTx.status).toBe(TransactionStatus.Completed);
    expect(completedTx.txHash).toBe('0xTxHash123');
    expect(completedTx.blockNumber).toBe(12345);
    expect(completedTx.gasUsed).toBe(21000);
    expect(completedTx.id).toBe(tx.id);
    expect(completedTx.completedAt).toBeDefined();
  });

  it('should throw error when marking non-pending transaction as completed', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
    });

    const completedTx = tx.markAsCompleted('0xTxHash123');

    expect(() => {
      completedTx.markAsCompleted('0xTxHash456');
    }).toThrow('Only pending or processing transactions can be completed');
  });

  it('should mark transaction as failed', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
    });

    const failedTx = tx.markAsFailed('Insufficient gas');

    expect(failedTx.status).toBe(TransactionStatus.Failed);
    expect(failedTx.errorMessage).toBe('Insufficient gas');
  });

  it('should determine if transaction can be cancelled', () => {
    const pendingTx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
    });

    expect(pendingTx.canBeCancelled()).toBe(true);

    const completedTx = pendingTx.markAsCompleted('0xHash');
    expect(completedTx.canBeCancelled()).toBe(false);
  });

  it('should calculate exchange amount when rate is provided', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toUserId: 'user-2',
      amount: { value: 100, currency: 'USDC' },
      exchangeRate: 3.72,
    });

    expect(tx.amountPen).toBe(372);
    expect(tx.exchangeRate).toBe(3.72);
  });

  it('should store toAddress for EVM addresses', () => {
    const tx = Transaction.create({
      fromUserId: 'user-1',
      toAddress: '0x1234567890abcdef1234567890abcdef12345678',
      amount: { value: 50, currency: 'USDC' },
    });

    expect(tx.toAddress).toBe(
      '0x1234567890abcdef1234567890abcdef12345678'
    );
  });
});
