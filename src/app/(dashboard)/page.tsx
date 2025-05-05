import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/features/auth/auth-actions';

export default async function Home() {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');
  return (
    <div>
      This is a home page.
    </div>
  );
}
