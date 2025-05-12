import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { env } from '@/env';
import { ID } from 'node-appwrite';
import { getFileAsDataUrl } from '@/lib/better-upload-handler';

const app = new Hono()
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { name, image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined;

      // If image is a string and looks like a fileId from Better Upload
      if (typeof image === 'string' && image.trim() !== '') {
        try {
          // Check if this is a fileId we should retrieve
          if (!image.startsWith('data:') && !image.startsWith('http')) {
            // This is likely a fileId, get it as a data URL
            uploadedImageUrl = await getFileAsDataUrl(image);
          } else {
            // This is already a URL or data URL, use directly
            uploadedImageUrl = image;
          }
        } catch (error) {
          console.error('Error retrieving image:', error);
          // Continue without image if retrieval fails
        }
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