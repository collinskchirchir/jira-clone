import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { getWorkspaces } from '@/features/workspaces/workspace-queries';

export default async function Home() {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  const workspaces = await getWorkspaces();
  if (workspaces.total === 0) {
    redirect('/workspaces/create');
  } else {
    redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }

}
