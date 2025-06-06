import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { createWorkspaceSchema, updateWorkspaceSchema } from '@/features/workspaces/workspaces-schema';
import { sessionMiddleware } from '@/lib/session-middleware';
import { env } from '@/env';
import { ID, Query } from 'node-appwrite';
import { getPublicFileUrl } from '@/lib/better-upload-handler';
import { MemberRole } from '@/features/members/types';
import { generateInviteCode } from '@/lib/utils';
import { getMember } from '@/features/members/member-utils';
import { Workspace } from '@/features/workspaces/workspace-types';

const app = new Hono()
  .get(
    '/',
    sessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');

      // extract all members that logged in user is a part of
      const members = await databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
        [Query.equal('userId', user.$id)],
      );
      if (members.total === 0) {
        return c.json({ data: { documents: [], total: 0 } });
      }

      const workspaceIds = members.documents.map((member) => member.workspaceId);

      const workspaces = await databases.listDocuments(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        [
          Query.orderDesc('$createdAt'),
          Query.contains('$id', workspaceIds),
        ],
      );
      return c.json({ data: workspaces });
    })
  .get(
    '/:workspaceId',
    sessionMiddleware,
    async (c) => {
      const user = c.get('user');
      const databases = c.get('databases');
      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const workspace = await databases.getDocument<Workspace>(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: workspace });
    },
  )
  .delete(
    '/:workspaceId',
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // TODO: Delete members, projects, and tasks

      await databases.deleteDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        workspaceId,
      );

      return c.json({ data: { $id: workspaceId } });
    },
  ).post(
    '/:workspaceId/reset-invite-code',
    sessionMiddleware,
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId } = c.req.param();

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (!member || member.role !== MemberRole.ADMIN) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const workspace = await databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        workspaceId,
        {
          inviteCode: generateInviteCode(6),
        },
      );

      return c.json({ data: workspace });
    },
  )
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

      const workspace = await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        ID.unique(),
        {
          name,
          userId: user.$id,
          imageUrl: uploadedImageUrl,
          inviteCode: generateInviteCode(6),
        },
      );

      await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
        ID.unique(),
        {
          userId: user.$id,
          workspaceId: workspace.$id,
          role: MemberRole.ADMIN,
        },
      );
      return c.json({ data: workspace });
    },
  )
  .patch(
    '/:workspaceId',
    sessionMiddleware,
    zValidator('form', updateWorkspaceSchema),
    async (c) => {
      const databases = c.get('databases');
      const user = c.get('user');

      const { workspaceId } = c.req.param();
      const { name, image } = c.req.valid('form');
      // check is user is member of workspace
      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });
      if (!member || member.role !== MemberRole.ADMIN) {
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

      const workspace = await databases.updateDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        workspaceId,
        {
          name,
          imageUrl: uploadedImageUrl,
        },
      );
      return c.json({ data: workspace });
    })
  .post(
    '/:workspaceId/join',
    sessionMiddleware,
    zValidator('json', z.object({ code: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.param();
      const { code } = c.req.valid('json');

      const databases = c.get('databases');
      const user = c.get('user');

      const member = await getMember({
        databases,
        workspaceId,
        userId: user.$id,
      });

      if (member) {
        return c.json({ error: 'Already a member' }, 400);
      }

      const workspace = await databases.getDocument<Workspace>(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
        workspaceId,
      );

      if (workspace.inviteCode !== code) {
        return c.json({ error: 'Invalid invite code' }, 400);
      }

      await databases.createDocument(
        env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
        ID.unique(),
        {
          workspaceId,
          userId: user.$id,
          role: MemberRole.MEMBER,
        },
      );
      return c.json({ data: workspace });

    },
  )
;

export default app;