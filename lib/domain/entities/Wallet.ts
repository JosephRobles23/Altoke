export interface Balance {
  hbar: number;
  usdc: number;
}

export type NetworkType = 'testnet' | 'mainnet';

export interface WalletProps {
  id: string;
  userId: string;
  accountId: string;
  publicKey: string;
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
  public readonly accountId: string;
  public readonly publicKey: string;
  public readonly privateKeyEncrypted?: string;
  public readonly balance: Balance;
  public readonly isActive: boolean;
  public readonly network: NetworkType;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: WalletProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.accountId = props.accountId;
    this.publicKey = props.publicKey;
    this.privateKeyEncrypted = props.privateKeyEncrypted;
    this.balance = props.balance;
    this.isActive = props.isActive;
    this.network = props.network;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  hasEnoughBalance(amount: number, currency: 'hbar' | 'usdc' = 'usdc'): boolean {
    return this.balance[currency] >= amount;
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
