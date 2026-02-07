/**
 * Value Object para Transaction Hash (EVM)
 * Formato: 0x seguido de 64 caracteres hexadecimales
 */
export class TransactionHash {
  private static readonly PATTERN = /^0x[a-fA-F0-9]{64}$/;

  private constructor(public readonly value: string) {}

  static create(value: string): TransactionHash {
    if (!value || value.trim().length === 0) {
      throw new Error('Transaction hash cannot be empty');
    }
    return new TransactionHash(value.trim().toLowerCase());
  }

  static isValid(value: string): boolean {
    return TransactionHash.PATTERN.test(value);
  }

  toString(): string {
    return this.value;
  }

  /**
   * Retorna hash truncado para mostrar en UI: 0x1234...abcd
   */
  get truncated(): string {
    return `${this.value.slice(0, 10)}...${this.value.slice(-8)}`;
  }

  equals(other: TransactionHash): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toExplorerUrl(
    network: 'base-sepolia' | 'base' = 'base-sepolia'
  ): string {
    const baseUrl =
      network === 'base-sepolia'
        ? 'https://sepolia.basescan.org'
        : 'https://basescan.org';
    return `${baseUrl}/tx/${this.value}`;
  }
}
