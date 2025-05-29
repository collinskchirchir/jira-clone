import { handle } from 'hono/vercel';
import app from './app';

import auth from '@/features/auth/server/auth';
import upload from '@/features/upload/server/upload';
import workspaces from '@/features/workspaces/server/workspaces';
import members from '@/features/members/server/members';
import projects from '@/features/projects/server/projects';

const routes = app
  .route('/auth', auth)
  .route('/workspaces', workspaces)
  .route('/upload', upload)
  .route('/members', members)
  .route('projects', projects)
;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;