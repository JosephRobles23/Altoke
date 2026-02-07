export interface WalletCreatedEvent {
  type: 'WALLET_CREATED';
  payload: {
    walletId: string;
    userId: string;
    address: string;
    network: string;
    timestamp: Date;
  };
}

export function createWalletCreatedEvent(params: {
  walletId: string;
  userId: string;
  address: string;
  network: string;
}): WalletCreatedEvent {
  return {
    type: 'WALLET_CREATED',
    payload: {
      ...params,
      timestamp: new Date(),
    },
  };
}
