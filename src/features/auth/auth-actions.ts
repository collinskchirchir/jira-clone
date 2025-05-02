'use server';

import { cookies } from 'next/headers';
import { env } from '@/env';
import { Account, Client } from 'node-appwrite';

import { AUTH_COOKIE } from '@/features/auth/constants';

// special util in server components (e.g page.tsx) serving as authorization checks
export const getCurrentSession = async () => {
  const client = new Client()
    .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT);
  // .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  // .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  // might need to use 'await cookie' in Next v15>
  const session = cookies().get(AUTH_COOKIE);
  if (!session || !session.value) {
    // console.log("No session value found.");
    return null
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
};
