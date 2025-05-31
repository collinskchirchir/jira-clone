import { Hono } from 'hono';
import { sessionMiddleware } from '@/lib/session-middleware';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { getMember } from '@/features/members/member-utils';
import { env } from '@/env';
import { ID, Query } from 'node-appwrite';
import { createProjectSchema, updateProjectSchema } from '@/features/projects/project-schema';
import { getPublicFileUrl } from '@/lib/better-upload-handler';
import { Project } from '@/features/projects/project-types';

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
  )
  .get(
    '/:projectId',
    sessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { projectId } = c.req.param();

      const project = await databases.getDocument<Project>(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
        projectId,
      );

      const member = await getMember({
        databases,
        workspaceId: project.workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      return c.json({ data: project });
    },
  )
  .patch(
    '/:projectId',
    sessionMiddleware,
    zValidator('form', updateProjectSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { projectId } = c.req.param();
      const { name, image } = c.req.valid('form');

      const existingProject = await databases.getDocument<Project>(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
        projectId,
      );
      // check is user is member of workspace
      const member = await getMember({
        databases,
        workspaceId: existingProject.workspaceId,
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

      const project = await databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_PROJECTS_ID,
        projectId,
        {
          name,
          imageUrl: uploadedImageUrl,
        },
      );
      return c.json({ data: project });
    })
;

export default app;