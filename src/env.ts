import { z } from 'zod';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

expand(config())

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  NEXT_PUBLIC_APP_URL: z.string().min(1),
  LOG_LEVEL: z.enum([
    'fatal',
    'error',
    'warn',
    'info',
    'debug',
    'trace',
    'silent',
  ]),
});

// export type Env = z.infer<typeof envSchema>

const { data: env, error } = envSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!