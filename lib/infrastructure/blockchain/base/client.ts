import { createPublicClient, createWalletClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { USDC_ADDRESSES, EXPLORER_URLS } from './contracts';

const network = (process.env.NEXT_PUBLIC_BASE_NETWORK || 'base-sepolia') as
  | 'base-sepolia'
  | 'base';

const isTestnet = network === 'base-sepolia';
const chain = isTestnet ? baseSepolia : base;
const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ||
  (isTestnet ? 'https://sepolia.base.org' : 'https://mainnet.base.org');

/**
 * Cliente público (lectura) — balances, receipts, readContract
 */
export const publicClient = createPublicClient({
  chain,
  transport: http(rpcUrl),
});

/**
 * Crea un wallet client para firmar y enviar transacciones
 */
export function getWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);
  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}

/**
 * Configuración de la red actual
 */
export const CHAIN_CONFIG = {
  chain,
  network,
  isTestnet,
  explorer: EXPLORER_URLS[network],
  usdc: USDC_ADDRESSES[network],
} as const;
