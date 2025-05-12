import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  /*
  * ServerSide Environment variables, not available on the client.
  */
  server: {
    NODE_ENV: z.string().default('development'),
    LOG_LEVEL: z.enum([
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
      'silent',
    ]),
    NEXT_APPWRITE_KEY: z.string().min(1),

    CLOUDFLARE_R2_ENDPOINT: z.string().min(1),
    CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
    // Add other server-only env vars here
  },

  /*
   * Environment variables available on the client (and server).
   * The prefix that client-side variables must have.
   * Next.js uses NEXT_PUBLIC_ as the standard prefix.
   */
  clientPrefix: 'NEXT_PUBLIC_',
  client: {
    NEXT_PUBLIC_APP_URL: z.string().min(1),
    NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().min(1),
    NEXT_PUBLIC_APPWRITE_PROJECT: z.string().min(1),
    NEXT_PUBLIC_APPWRITE_DATABASE_ID: z.string().min(1),
    NEXT_PUBLIC_APPWRITE_WORKSPACES_ID: z.string().min(1),
    NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID: z.string().min(1),
    // Add other client-safe env vars here
  },

  /**
   * Explicitly map environment variables from process.env to our schema
   */
  runtimeEnv:
    {
      NODE_ENV: process.env.NODE_ENV,
      LOG_LEVEL: process.env.LOG_LEVEL,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_APPWRITE_KEY: process.env.NEXT_APPWRITE_KEY,
      NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      NEXT_PUBLIC_APPWRITE_PROJECT: process.env.NEXT_PUBLIC_APPWRITE_PROJECT,
      NEXT_PUBLIC_APPWRITE_DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      NEXT_PUBLIC_APPWRITE_WORKSPACES_ID: process.env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
      CLOUDFLARE_R2_ENDPOINT: process.env.CLOUDFLARE_R2_ENDPOINT,
      CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,


      // Add other env vars here
    },
  // runtimeEnv: process.env,


  /**
   * Handle empty strings for required variables
   */
  emptyStringAsUndefined: true,
});