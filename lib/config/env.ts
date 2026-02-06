import { z } from 'zod';

/**
 * Schema de validación para variables de entorno
 * Asegura que todas las variables requeridas estén definidas
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Hedera
  HEDERA_NETWORK: z.enum(['testnet', 'mainnet']).default('testnet'),
  HEDERA_OPERATOR_ID: z.string().regex(/^\d+\.\d+\.\d+$/),
  HEDERA_OPERATOR_KEY: z.string().min(1),
  HEDERA_USDC_TOKEN_ID: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),

  // Encryption
  ENCRYPTION_MASTER_PASSWORD: z.string().min(32),

  // Transak
  NEXT_PUBLIC_TRANSAK_API_KEY: z.string().optional(),
  TRANSAK_SECRET_KEY: z.string().optional(),
  TRANSAK_ENVIRONMENT: z.enum(['STAGING', 'PRODUCTION']).default('STAGING'),

  // Exchange Rate
  EXCHANGE_RATE_API_KEY: z.string().optional(),
  EXCHANGE_RATE_API_URL: z.string().url().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => e.path.join('.'));
      console.error(
        `\n❌ Variables de entorno faltantes o inválidas:\n${missingVars.join('\n')}\n`
      );
      console.error('Copia .env.local.example como .env.local y completa los valores.\n');
    }
    throw new Error('Invalid environment variables');
  }
}

/**
 * Variables de entorno validadas
 * Importar este módulo para acceder a las variables de forma segura
 */
export const env = validateEnv();
