/**
 * Value Object para Account ID de Hedera
 * Formato: shard.realm.num (ej: 0.0.12345)
 */
export class AccountId {
  private static readonly PATTERN = /^\d+\.\d+\.\d+$/;

  private constructor(public readonly value: string) {}

  static create(value: string): AccountId {
    if (!AccountId.PATTERN.test(value)) {
      throw new Error(`Invalid Hedera Account ID format: ${value}. Expected format: shard.realm.num`);
    }
    return new AccountId(value);
  }

  static isValid(value: string): boolean {
    return AccountId.PATTERN.test(value);
  }

  get shard(): number {
    return parseInt(this.value.split('.')[0], 10);
  }

  get realm(): number {
    return parseInt(this.value.split('.')[1], 10);
  }

  get num(): number {
    return parseInt(this.value.split('.')[2], 10);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AccountId): boolean {
    return this.value === other.value;
  }

  toExplorerUrl(network: 'testnet' | 'mainnet' = 'testnet'): string {
    return `https://hashscan.io/${network}/account/${this.value}`;
  }
}
