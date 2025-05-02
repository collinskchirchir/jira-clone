import {redirect} from 'next/navigation';
import {getCurrentSession} from '@/features/auth/auth-actions';
import {UserButton} from '@/features/auth/components/user-button';

export default async function Home() {
  const user = await getCurrentSession()
  if (!user) redirect('/sign-in')
  return (
    <div>
      <UserButton />
    </div>
  );
}
