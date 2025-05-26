import { createSessionClient } from '@/lib/appwrite';

// special util in server components (e.g page.tsx) serving as authorization checks
export const getCurrentSession = async () => {
  try {
    const { account } = await createSessionClient();
    return account.get();
  } catch {
    return null;
  }
};
