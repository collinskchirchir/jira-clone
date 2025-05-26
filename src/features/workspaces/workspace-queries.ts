import { cookies } from 'next/headers';
import { env } from '@/env';
import { Account, Client, Databases, Query } from 'node-appwrite';

import { AUTH_COOKIE } from '@/features/auth/constants';
import { getMember } from '@/features/members/member-utils';
import { Workspace } from '@/features/workspaces/workspace-types';

// special util in server components (e.g page.tsx) serving as authorization checks
export const getWorkspaces = async () => {
  try {

    const client = new Client()
      .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT);
    // .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    // .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    // might need to use 'await cookie' in Next v15>
    const session = cookies().get(AUTH_COOKIE);
    if (!session || !session.value) {
      // console.log("No session value found.");
      return { documents: [], total: 0 };
    }

    client.setSession(session.value);

    const databases = new Databases(client);
    const account = new Account(client);
    const user = await account.get();


    // extract all members that logged in user is a part of
    const members = await databases.listDocuments(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
      [Query.equal('userId', user.$id)],
    );
    if (members.total === 0) {
      return ({ documents: [], total: 0 });
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
    return workspaces;
  } catch {
    return { documents: [], total: 0 };
  }
};

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {

    const client = new Client()
      .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
      .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT);
    // .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    // .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    // might need to use 'await cookie' in Next v15>
    const session = cookies().get(AUTH_COOKIE);
    if (!session || !session.value) {
      // console.log("No session value found.");
      return null;
    }

    client.setSession(session.value);

    const databases = new Databases(client);
    const account = new Account(client);
    const user = await account.get();

    // extract all members that logged in user is a part of
    const member = await getMember({
      databases,
      workspaceId,
      userId: user.$id,
    });

    if (!member) {
      return null;
    }

    const workspace = await databases.getDocument<Workspace>(
      env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      env.NEXT_PUBLIC_APPWRITE_WORKSPACES_ID,
      workspaceId,
    );
    return workspace;
  } catch {
    return null;
  }
};
