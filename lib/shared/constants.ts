/**
 * Constantes de la aplicación
 */

// Base (Blockchain)
export const BASE_EXPLORER_URL = {
  'base-sepolia': 'https://sepolia.basescan.org',
  base: 'https://basescan.org',
} as const;

// Transacciones
export const TRANSACTION_LIMITS = {
  MIN_AMOUNT_USDC: 0.01,
  MAX_AMOUNT_USDC: 10000,
  FEE_PERCENTAGE: 0.005, // 0.5%
  MIN_FEE_USDC: 0.01,
} as const;

// KYC
export const KYC_LEVELS = {
  0: { label: 'Sin verificar', maxTransfer: 0 },
  1: { label: 'Básico', maxTransfer: 500 },
  2: { label: 'Intermedio', maxTransfer: 5000 },
  3: { label: 'Avanzado', maxTransfer: 10000 },
} as const;

// Monedas soportadas
export const SUPPORTED_FIAT_CURRENCIES = ['USD', 'PEN'] as const;
export const SUPPORTED_CRYPTO_CURRENCIES = ['USDC', 'ETH'] as const;

// Paginación
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
