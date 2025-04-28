import { handle } from 'hono/vercel';
import auth from '@/features/auth/server/route';

import app from './app';

const routes = app
  .route("/auth", auth)

export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;