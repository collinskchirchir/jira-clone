import React from 'react';
import { redirect } from 'next/navigation';
import { WorkspaceIdSettingsClient } from '@/app/(standalone)/workspaces/[workspaceId]/settings/client';
import { getCurrentSession } from '@/features/auth/auth-queries';

const WorkspaceIdSettingsPage = async () => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  return <WorkspaceIdSettingsClient />;
};

export default WorkspaceIdSettingsPage;
