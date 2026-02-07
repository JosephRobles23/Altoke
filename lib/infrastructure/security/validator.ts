import { z } from 'zod';

/**
 * Schemas de validación centralizados usando Zod
 */

export const emailSchema = z.string().email('Email inválido');

export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

export const evmAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Dirección EVM inválida. Formato: 0x seguido de 40 hex chars');

export const amountSchema = z
  .number()
  .positive('El monto debe ser positivo')
  .max(10000, 'El monto máximo es 10,000');

export const uuidSchema = z.string().uuid('ID inválido');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s-]{8,15}$/, 'Número de teléfono inválido')
  .optional();

/**
 * Valida datos y retorna resultado tipado
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: result.error.flatten().fieldErrors as Record<string, string[]>,
  };
}
