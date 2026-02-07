export interface TransactionCreatedEvent {
  type: 'TRANSACTION_CREATED';
  payload: {
    transactionId: string;
    fromUserId: string;
    toUserId?: string;
    toAddress?: string;
    amountUsdc: number;
    timestamp: Date;
  };
}

export function createTransactionCreatedEvent(params: {
  transactionId: string;
  fromUserId: string;
  toUserId?: string;
  toAddress?: string;
  amountUsdc: number;
}): TransactionCreatedEvent {
  return {
    type: 'TRANSACTION_CREATED',
    payload: {
      ...params,
      timestamp: new Date(),
    },
  };
}
