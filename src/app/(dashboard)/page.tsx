import {redirect} from 'next/navigation';
import {getCurrentSession} from '@/features/auth/auth-actions';
import {CreateWorkspaceForm} from "@/features/workspaces/components/create-workspace-form";

export default async function Home() {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');
  return (
    <div>
      <CreateWorkspaceForm />
    </div>
  );
}
