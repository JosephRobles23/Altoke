export interface TransakConfig {
  apiKey: string;
  environment: string;
  cryptoCurrencyCode: string;
  network: string;
  walletAddress: string;
  fiatAmount: number;
  fiatCurrency: string;
  email?: string;
  disableWalletAddressForm: boolean;
  themeColor: string;
}

export interface TransakOrderData {
  id: string;
  status: TransakOrderStatus;
  fiatAmount: number;
  fiatCurrency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  walletAddress: string;
  completedAt?: string;
  createdAt: string;
}

export type TransakOrderStatus =
  | 'AWAITING_PAYMENT_FROM_USER'
  | 'PAYMENT_DONE_MARKED_BY_USER'
  | 'PROCESSING'
  | 'PENDING_DELIVERY_FROM_TRANSAK'
  | 'ON_HOLD_PENDING_DELIVERY_FROM_TRANSAK'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REFUNDED'
  | 'EXPIRED';

export interface TransakWebhookEvent {
  eventID: string;
  createdAt: string;
  webhookData: TransakOrderData;
}
