export interface Balance {
  eth: number;
  usdc: number;
}

export type NetworkType = 'base-sepolia' | 'base';

export interface WalletProps {
  id: string;
  userId: string;
  address: string;
  privateKeyEncrypted?: string;
  balance: Balance;
  isActive: boolean;
  network: NetworkType;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet {
  public readonly id: string;
  public readonly userId: string;
  public readonly address: string;
  public readonly privateKeyEncrypted?: string;
  public readonly balance: Balance;
  public readonly isActive: boolean;
  public readonly network: NetworkType;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WalletProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.address = props.address;
    this.privateKeyEncrypted = props.privateKeyEncrypted;
    this.balance = props.balance;
    this.isActive = props.isActive;
    this.network = props.network;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  hasEnoughBalance(
    amount: number,
    currency: 'eth' | 'usdc' = 'usdc'
  ): boolean {
    return this.balance[currency] >= amount;
  }

  /**
   * Dirección truncada para mostrar en UI: 0x1234...abcd
   */
  get truncatedAddress(): string {
    return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
  }

  static create(
    props: Omit<WalletProps, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & {
      id?: string;
    }
  ): Wallet {
    return new Wallet({
      ...props,
      id: props.id || crypto.randomUUID(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
