import { env } from '@/env';
import { Account, Client } from 'node-appwrite';

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT)
    .setKey(env.NEXT_APPWRITE_KEY)
  return {
    get account () {
      return new Account(client)
    }
  }
}