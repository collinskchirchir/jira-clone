import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { env } from '@/env';
import { ID } from 'node-appwrite';
import { getPublicFileUrl } from '@/lib/better-upload-handler';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const workspaces = await databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      );
      return c.json({ data: workspaces });
    })
  .post(
    '/',
    zValidator('form', createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { name, image } = c.req.valid('form');

      let uploadedImageUrl: string | undefined;

      // Handle the image URL
      if (typeof image === 'string' && image.trim() !== '') {
        try {
          // Check if this is a fileId from Better Upload (not already a complete URL)
          if (!image.startsWith('data:') && !image.startsWith('http')) {
            // This is a fileId from Better Upload, construct a public URL using our helper
            // This will create a URL using the R2 endpoint and bucket name
            uploadedImageUrl = getPublicFileUrl(image);
            console.log('Generated public URL for image:', uploadedImageUrl);
          } else {
            // This is already a URL or data URL, use it directly
            uploadedImageUrl = image;
          }
        } catch (error) {
          console.error('Error processing image URL:', error);
          // Continue without image if there's an error
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