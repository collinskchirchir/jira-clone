import React from 'react';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { redirect } from 'next/navigation';
import { getWorkspaceInfo } from '@/features/workspaces/workspace-queries';
import JoinWorkspaceForm from '@/features/workspaces/components/join-workspace-form';

interface WorkpaceIdJoinPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdJoinPage = async ({ params }: WorkpaceIdJoinPageProps) => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  const initialValues = await getWorkspaceInfo({ workspaceId: params.workspaceId });

  if (!initialValues) {
    redirect('/');
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  );
};

export default WorkspaceIdJoinPage;