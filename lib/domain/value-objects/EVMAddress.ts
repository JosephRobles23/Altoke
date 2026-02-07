/**
 * Value Object para direcciones EVM (Base / Ethereum)
 * Formato: 0x seguido de 40 caracteres hexadecimales
 */
export class EVMAddress {
  private static readonly PATTERN = /^0x[a-fA-F0-9]{40}$/;

  private constructor(public readonly value: string) {}

  static create(value: string): EVMAddress {
    if (!EVMAddress.PATTERN.test(value)) {
      throw new Error(
        `Formato de dirección EVM inválido: ${value}. Formato esperado: 0x seguido de 40 hex chars`
      );
    }
    return new EVMAddress(value.toLowerCase());
  }

  static isValid(value: string): boolean {
    return EVMAddress.PATTERN.test(value);
  }

  /**
   * Retorna dirección truncada para mostrar en UI: 0x1234...abcd
   */
  get truncated(): string {
    return `${this.value.slice(0, 6)}...${this.value.slice(-4)}`;
  }

  toString(): string {
    return this.value;
  }

  equals(other: EVMAddress): boolean {
    return this.value.toLowerCase() === other.value.toLowerCase();
  }

  toExplorerUrl(network: 'base-sepolia' | 'base' = 'base-sepolia'): string {
    const baseUrl =
      network === 'base-sepolia'
        ? 'https://sepolia.basescan.org'
        : 'https://basescan.org';
    return `${baseUrl}/address/${this.value}`;
  }
}
