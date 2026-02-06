/**
 * Value Object para Transaction Hash / ID de Hedera
 * Formato del Transaction ID: shard.realm.num@seconds.nanoseconds
 */
export class TransactionHash {
  private constructor(public readonly value: string) {}

  static create(value: string): TransactionHash {
    if (!value || value.trim().length === 0) {
      throw new Error('Transaction hash cannot be empty');
    }
    return new TransactionHash(value.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: TransactionHash): boolean {
    return this.value === other.value;
  }

  toExplorerUrl(network: 'testnet' | 'mainnet' = 'testnet'): string {
    return `https://hashscan.io/${network}/transaction/${this.value}`;
  }
}
