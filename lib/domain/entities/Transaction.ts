import { Money } from '@/lib/domain/value-objects/Money';

export enum TransactionStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export enum TransactionType {
  Send = 'send',
  Receive = 'receive',
  Buy = 'buy',
  Sell = 'sell',
}

export interface TransactionProps {
  id: string;
  fromUserId: string;
  toUserId?: string;
  toAddress?: string;
  type: TransactionType;
  status: TransactionStatus;
  amountUsdc: number;
  amountPen?: number;
  exchangeRate?: number;
  feeUsdc: number;
  feePlatform: number;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  description?: string;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export class Transaction {
  public readonly id: string;
  public readonly fromUserId: string;
  public readonly toUserId?: string;
  public readonly toAddress?: string;
  public readonly type: TransactionType;
  public readonly status: TransactionStatus;
  public readonly amountUsdc: number;
  public readonly amountPen?: number;
  public readonly exchangeRate?: number;
  public readonly feeUsdc: number;
  public readonly feePlatform: number;
  public readonly txHash?: string;
  public readonly blockNumber?: number;
  public readonly gasUsed?: number;
  public readonly description?: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly errorMessage?: string;
  public readonly createdAt: Date;
  public readonly completedAt?: Date;
  public readonly updatedAt: Date;

  constructor(props: TransactionProps) {
    this.id = props.id;
    this.fromUserId = props.fromUserId;
    this.toUserId = props.toUserId;
    this.toAddress = props.toAddress;
    this.type = props.type;
    this.status = props.status;
    this.amountUsdc = props.amountUsdc;
    this.amountPen = props.amountPen;
    this.exchangeRate = props.exchangeRate;
    this.feeUsdc = props.feeUsdc;
    this.feePlatform = props.feePlatform;
    this.txHash = props.txHash;
    this.blockNumber = props.blockNumber;
    this.gasUsed = props.gasUsed;
    this.description = props.description;
    this.metadata = props.metadata;
    this.errorMessage = props.errorMessage;
    this.createdAt = props.createdAt;
    this.completedAt = props.completedAt;
    this.updatedAt = props.updatedAt;
  }

  canBeCancelled(): boolean {
    return this.status === TransactionStatus.Pending;
  }

  markAsCompleted(txHash: string, blockNumber?: number, gasUsed?: number): Transaction {
    if (
      this.status !== TransactionStatus.Pending &&
      this.status !== TransactionStatus.Processing
    ) {
      throw new Error(
        'Only pending or processing transactions can be completed'
      );
    }
    return new Transaction({
      ...this.toProps(),
      status: TransactionStatus.Completed,
      txHash,
      blockNumber,
      gasUsed,
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  markAsFailed(errorMessage: string): Transaction {
    return new Transaction({
      ...this.toProps(),
      status: TransactionStatus.Failed,
      errorMessage,
      updatedAt: new Date(),
    });
  }

  markAsProcessing(): Transaction {
    if (this.status !== TransactionStatus.Pending) {
      throw new Error('Only pending transactions can be set to processing');
    }
    return new Transaction({
      ...this.toProps(),
      status: TransactionStatus.Processing,
      updatedAt: new Date(),
    });
  }

  get amount(): Money {
    return Money.fromUSDC(this.amountUsdc);
  }

  private toProps(): TransactionProps {
    return {
      id: this.id,
      fromUserId: this.fromUserId,
      toUserId: this.toUserId,
      toAddress: this.toAddress,
      type: this.type,
      status: this.status,
      amountUsdc: this.amountUsdc,
      amountPen: this.amountPen,
      exchangeRate: this.exchangeRate,
      feeUsdc: this.feeUsdc,
      feePlatform: this.feePlatform,
      txHash: this.txHash,
      blockNumber: this.blockNumber,
      gasUsed: this.gasUsed,
      description: this.description,
      metadata: this.metadata,
      errorMessage: this.errorMessage,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      updatedAt: this.updatedAt,
    };
  }

  static create(params: {
    fromUserId: string;
    toUserId?: string;
    toAddress?: string;
    amount: { value: number; currency: string };
    type?: TransactionType;
    exchangeRate?: number;
    description?: string;
  }): Transaction {
    const amountPen = params.exchangeRate
      ? params.amount.value * params.exchangeRate
      : undefined;

    return new Transaction({
      id: crypto.randomUUID(),
      fromUserId: params.fromUserId,
      toUserId: params.toUserId,
      toAddress: params.toAddress,
      type: params.type || TransactionType.Send,
      status: TransactionStatus.Pending,
      amountUsdc: params.amount.value,
      amountPen,
      exchangeRate: params.exchangeRate,
      feeUsdc: 0,
      feePlatform: 0,
      description: params.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
