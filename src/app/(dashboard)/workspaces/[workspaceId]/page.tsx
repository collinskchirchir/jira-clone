import React from 'react';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { redirect } from 'next/navigation';

const WorkspaceIdPage = async () => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');
  return (
    <div>
      Workspace Id
    </div>
  );
};

export default WorkspaceIdPage;