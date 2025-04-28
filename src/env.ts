import {createEnv} from '@t3-oss/env-core';
import {z} from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.string().default("development"),
    LOG_LEVEL: z.enum([
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
      'silent',
    ]),
    // Add other server-only env vars here
  },

  /**
   * The prefix that client-side variables must have.
   * Next.js uses NEXT_PUBLIC_ as the standard prefix.
   */
  clientPrefix: "NEXT_PUBLIC_",

  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    // Add other client-safe env vars here
  },

  /**
   * Explicitly map environment variables from process.env to our schema
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    // Add other env vars here
  },

  /**
   * Handle empty strings for required variables
   */
  emptyStringAsUndefined: true,
});