import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  DATABASE_SCHEMA: z.string().default('public'),
  JWT_SECRET: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  SUPABASE_ACCOUNT_ENDPOINT: z.url(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  REDIS_HOST: z.string().optional().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
  PORT: z.coerce.number().optional().default(3333),
  REDIS_PASSWORD: z.string().default('1234'),
})

export type Env = z.infer<typeof envSchema>
