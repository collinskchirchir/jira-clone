import React from 'react';
import { redirect } from 'next/navigation';
import { WorkspaceIdSettingsClient } from '@/app/(standalone)/workspaces/[workspaceId]/settings/client';
import { getCurrentSession } from '@/features/auth/auth-queries';

interface WorkpaceIdSettingsPageProps {
  params: {
    workspaceId: string;
  };
}

const WorkspaceIdSettingsPage = async ({ params }: WorkpaceIdSettingsPageProps) => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
