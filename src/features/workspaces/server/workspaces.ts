import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { env } from '@/env';
import { ID } from 'node-appwrite';

const app = new Hono()
  .post(
    '/',
    zValidator('json', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { name } = c.req.valid('json');

      const workspace = await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        ID.unique(),
        {
          name,
        },
      );
      return c.json({ data: workspace });
    },
  );

export default app;