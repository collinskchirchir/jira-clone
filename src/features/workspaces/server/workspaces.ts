import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { env } from '@/env';
import { ID } from 'node-appwrite';

const app = new Hono()
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const storage = c.get('storage');
      const user = c.get('user');

      const { name, image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined;
      if (image instanceof File) {
        const file = await storage.createFile(
          env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          ID.unique(),
          image,
        );
        // preview url
        const arrayBuffer = await storage.getFilePreview(
          env.NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID,
          file.$id,
        );

        uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
      }

      const workspace = await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
        },
      );
      return c.json({ data: workspace });
    },
  );

export default app;