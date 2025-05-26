import { type Databases, Query } from 'node-appwrite';
import { env } from '@/env';

interface GetMemberProps {
  databases: Databases;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({ databases, workspaceId, userId }: GetMemberProps) => {
  const members = await databases.listDocuments(
    env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    env.NEXT_PUBLIC_APPWRITE_MEMBERS_ID,
    [
      Query.equal('workspaceId', workspaceId),
      Query.equal('userId', userId),
    ],
  );
  return members.documents[0];
};