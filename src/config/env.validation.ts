import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  EVOLUTION_API_URL: z.url(),

  EVOLUTION_API_KEY: z.string().min(1, 'EVOLUTION_API_KEY is required'),

  EVOLUTION_INSTANCE: z.string().min(1, 'EVOLUTION_INSTANCE is required'),

  EVOLUTION_REQUEST_TIMEOUT: z.coerce.number().int().positive().default(10000),
});

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(
      `Environment validation failed:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
