/**
 * Utilidades de validación
 */

/**
 * Verifica si un string es un email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Verifica si un string es un Account ID de Hedera válido
 */
export function isValidHederaAccountId(accountId: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(accountId);
}

/**
 * Verifica si un monto es válido para transferencia
 */
export function isValidTransferAmount(amount: number): boolean {
  return amount > 0 && amount <= 10000 && Number.isFinite(amount);
}

/**
 * Sanitiza un string de input del usuario
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Verifica la fortaleza de una contraseña
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}
