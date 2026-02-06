export interface HederaAccount {
  accountId: string;
  publicKey: string;
  privateKey: string;
}

export interface HederaBalance {
  hbar: number;
  tokens: Record<string, number>;
}

export interface HederaTransactionResult {
  transactionId: string;
  status: string;
  receipt?: Record<string, unknown>;
}

export interface HederaTokenTransfer {
  from: string;
  to: string;
  tokenId: string;
  amount: number;
}
