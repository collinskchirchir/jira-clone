import { redirect } from 'next/navigation';


import { getCurrentSession } from '@/features/auth/auth-queries';
import { MembersList } from '@/features/members/components/member-list';


const WorkspaceIdMembersPage = async () => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  return (
    <div className="w-full lg:max-w-xl">
      <MembersList />
    </div>
  );
};

export default WorkspaceIdMembersPage;