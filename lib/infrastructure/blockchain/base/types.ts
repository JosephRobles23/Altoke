export interface BaseWallet {
  address: string;
  privateKeyEncrypted: string;
}

export interface BaseBalance {
  eth: number;
  usdc: number;
}

export interface BaseTransactionResult {
  txHash: string;
  blockNumber: bigint;
  gasUsed: bigint;
}
