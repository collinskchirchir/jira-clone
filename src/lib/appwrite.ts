import 'server-only';
import { env } from '@/env';
import { Account, Client, Databases, Users } from 'node-appwrite';
import { cookies } from 'next/headers';
import { AUTH_COOKIE } from '@/features/auth/constants';


export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT);

  // might need to use 'await cookie' in Next v15>
  const session = cookies().get(AUTH_COOKIE);
  if (!session || !session.value) {
    // console.log("No session value found.");
    throw new Error('Unauthorized');
  }
  client.setSession(session.value);
  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(env.NEXT_APPWRITE_KEY);
  return {
    get account() {
      return new Account(client);
    },
    get users() {
      return new Users(client);
    },
  };
}