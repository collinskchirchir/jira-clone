import { handle } from 'hono/vercel';
import auth from '@/features/auth/server/auth';
import upload from '@/features/upload/server/upload';
import workspaces from '@/features/workspaces/server/workspaces';

import app from './app';

const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/upload', upload);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;