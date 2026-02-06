export class Money {
  private constructor(
    public readonly value: number,
    public readonly currency: string
  ) {
    if (value < 0) {
      throw new Error('Money value cannot be negative');
    }
  }

  static fromUSDC(amount: number): Money {
    return new Money(amount, 'USDC');
  }

  static fromPEN(amount: number): Money {
    return new Money(amount, 'PEN');
  }

  static fromHBAR(amount: number): Money {
    return new Money(amount, 'HBAR');
  }

  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.value + other.value, this.currency);
  }

  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.value - other.value;
    if (result < 0) {
      throw new Error('Insufficient funds');
    }
    return new Money(result, this.currency);
  }

  isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.value > other.value;
  }

  isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.value < other.value;
  }

  isEqual(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.value === other.value;
  }

  format(): string {
    if (this.currency === 'PEN') {
      return `S/ ${this.value.toFixed(2)}`;
    }
    if (this.currency === 'USDC' || this.currency === 'USD') {
      return `$${this.value.toFixed(2)}`;
    }
    return `${this.value.toFixed(4)} ${this.currency}`;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(`Cannot operate on different currencies: ${this.currency} vs ${other.currency}`);
    }
  }
}
