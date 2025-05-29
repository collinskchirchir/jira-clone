import { Hono } from 'hono';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getMember } from '@/features/members/member-utils';
import { env } from '@/env';
import { ID, Query } from 'node-appwrite';
import { createProjectSchema } from '@/features/projects/project-schema';
import { getPublicFileUrl } from '@/lib/better-upload-handler';

const app = new Hono()
  .post(
    '/',
    sessionMiddleware,
    zValidator('form', createProjectSchema),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      const { name, image, workspaceId } = c.req.valid('form');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      let uploadedImageUrl: string | undefined;

      // Handle the image URL
      if (typeof image === 'string' && image.trim() !== '') {
        try {
          // Check if this is a fileId from Better Upload (not already a complete URL)
          if (!image.startsWith('data:') && !image.startsWith('http')) {
            // This is a fileId from Better Upload, construct a public URL using our helper
            // This will create a URL using the R2 endpoint and bucket name
            uploadedImageUrl = getPublicFileUrl(image);
            // console.log('Generated public URL for image:', uploadedImageUrl);
          } else {
            // This is already a URL or data URL, use it directly
            uploadedImageUrl = image;
          }
        } catch (error) {
          console.error('Error processing image URL:', error);
          // Continue without image if there's an error
        }
      }

      const project = await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          workspaceId,
        },
      );

      return c.json({ data: project });

    },
  )
  .get(
    '/',
    sessionMiddleware,
    zValidator('query', z.object({ workspaceId: z.string() })),
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      const { workspaceId } = c.req.valid('query');

      if (!workspaceId) {
        return c.json({ error: 'Missing workspaceId' }, 400);
      }

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }
      const projects = await databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
        [
          Query.equal('workspaceId', workspaceId),
          Query.orderDesc('$createdAt'),
        ],
      );
      return c.json({ data: projects });
    },
  );

export default app;