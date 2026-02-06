/**
 * Utilidades de formateo
 */

/**
 * Formatea un número como moneda USD
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formatea un número como moneda PEN
 */
export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount);
}

/**
 * Formatea un monto de USDC
 */
export function formatUSDC(amount: number): string {
  return `${amount.toFixed(2)} USDC`;
}

/**
 * Formatea un monto de HBAR
 */
export function formatHBAR(amount: number): string {
  return `${amount.toFixed(4)} HBAR`;
}

/**
 * Formatea una fecha en español
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Trunca un Account ID o hash para visualización
 */
export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
