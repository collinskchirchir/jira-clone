import { env } from '@/env';
import { Query } from 'node-appwrite';

import { getMember } from '@/features/members/member-utils';
import { Workspace } from '@/features/workspaces/workspace-types';
import { createSessionClient } from '@/lib/appwrite';

// special util in server components (e.g page.tsx) serving as authorization checks
export const getWorkspaces = async () => {
  const { account, databases } = await createSessionClient();
  const user = await account.get();

  // extract all members that logged in user is a part of
  const members = await databases.listDocuments(
    env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
    [Query.equal('userId', user.$id)],
  );
  if (members.total === 0) {
    return { documents: [], total: 0 };
  }

  const workspaceIds = members.documents.map((member) => member.workspaceId);

  const workspaces = await databases.listDocuments(
    env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    [Query.orderDesc('$createdAt'), Query.contains('$id', workspaceIds)],
  );
  return workspaces;
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {

  const { account, databases } = await createSessionClient();
  const user = await account.get();

  // extract all members that logged in user is a part of
  const member = await getMember({
    databases,
    workspaceId,
    userId: user.$id,
  });

  if (!member) {
    throw new Error('Unauthorized');
  }

  const workspace = await databases.getDocument<Workspace>(
    env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    workspaceId,
  );
  return workspace;

};


interface GetWorkspaceInfoProps {
  workspaceId: string;
}

export const getWorkspaceInfo = async ({ workspaceId }: GetWorkspaceInfoProps) => {

  const { databases } = await createSessionClient();

  const workspace = await databases.getDocument<Workspace>(
    env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
    workspaceId,
  );
  return { name: workspace.name };

};
