import React from 'react';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { redirect } from 'next/navigation';

interface WorkpaceIdJoinPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdJoinPage = async ({ params }: WorkpaceIdJoinPageProps) => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  
  return (
    <div>
      Workspace Id Join Page
    </div>
  );
};

export default WorkspaceIdJoinPage;