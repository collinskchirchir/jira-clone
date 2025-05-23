import { cookies } from 'next/headers';
import { env } from '@/env';
import { Account, Client, Databases, Query } from 'node-appwrite';

import { AUTH_COOKIE } from '@/features/auth/constants';

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
