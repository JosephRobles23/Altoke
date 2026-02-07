/**
 * Constantes de configuración de la aplicación
 */

export const APP_CONFIG = {
  name: 'Altoke',
  description: 'Plataforma de remesas USD → PEN con Base (Coinbase L2)',
  version: '0.1.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export const AUTH_CONFIG = {
  sessionExpiryMs: 7 * 24 * 60 * 60 * 1000, // 7 días
  passwordMinLength: 8,
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 min
} as const;

export const BASE_CONFIG = {
  network: (process.env.NEXT_PUBLIC_BASE_NETWORK || 'base-sepolia') as
    | 'base-sepolia'
    | 'base',
  usdcDecimals: 6,
} as const;

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  dashboard: '/dashboard',
  send: '/send',
  transactions: '/transactions',
  buy: '/buy',
  sell: '/sell',
  settings: '/settings',
} as const;

export const PROTECTED_ROUTES = [
  '/dashboard',
  '/send',
  '/transactions',
  '/buy',
  '/sell',
  '/settings',
] as const;

export const PUBLIC_ROUTES = ['/', '/login', '/signup'] as const;
