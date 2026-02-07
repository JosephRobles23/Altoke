/**
 * Direcciones de contratos y ABI para Base / Base Sepolia
 */

// USDC contract addresses
export const USDC_ADDRESSES = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const,
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const,
} as const;

// BaseScan explorer URLs
export const EXPLORER_URLS = {
  'base-sepolia': 'https://sepolia.basescan.org',
  base: 'https://basescan.org',
} as const;

// ABI mínimo de ERC-20 para transfer y balanceOf
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// USDC usa 6 decimales
export const USDC_DECIMALS = 6;
