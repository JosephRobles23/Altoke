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
  toAccountId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amountUsdc: number;
  amountPen?: number;
  exchangeRate?: number;
  feeUsdc: number;
  feePlatform: number;
  hederaTxId?: string;
  hederaTxHash?: string;
  consensusTimestamp?: string;
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
  public readonly toAccountId?: string;
  public readonly type: TransactionType;
  public readonly status: TransactionStatus;
  public readonly amountUsdc: number;
  public readonly amountPen?: number;
  public readonly exchangeRate?: number;
  public readonly feeUsdc: number;
  public readonly feePlatform: number;
  public readonly hederaTxId?: string;
  public readonly hederaTxHash?: string;
  public readonly consensusTimestamp?: string;
  public readonly description?: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly errorMessage?: string;
  public readonly createdAt: Date;
  public readonly completedAt?: Date;
  public readonly updatedAt: Date;

  constructor(props: TransactionProps) {
    Object.assign(this, props);
    this.id = props.id;
    this.fromUserId = props.fromUserId;
    this.toUserId = props.toUserId;
    this.toAccountId = props.toAccountId;
    this.type = props.type;
    this.status = props.status;
    this.amountUsdc = props.amountUsdc;
    this.amountPen = props.amountPen;
    this.exchangeRate = props.exchangeRate;
    this.feeUsdc = props.feeUsdc;
    this.feePlatform = props.feePlatform;
    this.hederaTxId = props.hederaTxId;
    this.hederaTxHash = props.hederaTxHash;
    this.consensusTimestamp = props.consensusTimestamp;
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

  markAsCompleted(txHash: string, hederaTxId?: string): Transaction {
    if (this.status !== TransactionStatus.Pending && this.status !== TransactionStatus.Processing) {
      throw new Error('Only pending or processing transactions can be completed');
    }
    return new Transaction({
      ...this.toProps(),
      status: TransactionStatus.Completed,
      hederaTxHash: txHash,
      hederaTxId: hederaTxId || this.hederaTxId,
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
      toAccountId: this.toAccountId,
      type: this.type,
      status: this.status,
      amountUsdc: this.amountUsdc,
      amountPen: this.amountPen,
      exchangeRate: this.exchangeRate,
      feeUsdc: this.feeUsdc,
      feePlatform: this.feePlatform,
      hederaTxId: this.hederaTxId,
      hederaTxHash: this.hederaTxHash,
      consensusTimestamp: this.consensusTimestamp,
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
    toAccountId?: string;
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
      toAccountId: params.toAccountId,
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
