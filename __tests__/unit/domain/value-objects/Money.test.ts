import { describe, it, expect } from 'vitest';
import { Money } from '@/lib/domain/value-objects/Money';

describe('Money Value Object', () => {
  it('should create USDC money', () => {
    const money = Money.fromUSDC(100);
    expect(money.value).toBe(100);
    expect(money.currency).toBe('USDC');
  });

  it('should create PEN money', () => {
    const money = Money.fromPEN(372);
    expect(money.value).toBe(372);
    expect(money.currency).toBe('PEN');
  });

  it('should create ETH money', () => {
    const money = Money.fromETH(0.5);
    expect(money.value).toBe(0.5);
    expect(money.currency).toBe('ETH');
  });

  it('should add same currency', () => {
    const a = Money.fromUSDC(100);
    const b = Money.fromUSDC(50);
    const result = a.add(b);
    expect(result.value).toBe(150);
  });

  it('should throw when adding different currencies', () => {
    const usd = Money.fromUSDC(100);
    const pen = Money.fromPEN(50);
    expect(() => usd.add(pen)).toThrow(
      'Cannot operate on different currencies'
    );
  });

  it('should subtract same currency', () => {
    const a = Money.fromUSDC(100);
    const b = Money.fromUSDC(30);
    const result = a.subtract(b);
    expect(result.value).toBe(70);
  });

  it('should throw when subtracting more than available', () => {
    const a = Money.fromUSDC(50);
    const b = Money.fromUSDC(100);
    expect(() => a.subtract(b)).toThrow('Insufficient funds');
  });

  it('should not allow negative values', () => {
    expect(() => Money.fromUSDC(-10)).toThrow(
      'Money value cannot be negative'
    );
  });

  it('should compare values correctly', () => {
    const a = Money.fromUSDC(100);
    const b = Money.fromUSDC(50);
    expect(a.isGreaterThan(b)).toBe(true);
    expect(b.isLessThan(a)).toBe(true);
    expect(a.isEqual(Money.fromUSDC(100))).toBe(true);
  });

  it('should format correctly', () => {
    expect(Money.fromUSDC(100).format()).toBe('$100.00');
    expect(Money.fromPEN(372.5).format()).toBe('S/ 372.50');
    expect(Money.fromETH(0.5).format()).toBe('0.500000 ETH');
  });
});
