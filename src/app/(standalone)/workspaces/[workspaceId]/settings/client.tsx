'use client';

import { useWorkspaceId } from '@/features/workspaces/hooks/use-workspace-id';
import { useGetWorkspace } from '@/features/workspaces/api/use-get-workspace';
import { PageLoader } from '@/components/page-loader';
import { redirect } from 'next/navigation';
import { EditWorkspaceForm } from '@/features/workspaces/components/edit-workspace-form';
import React from 'react';

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });
  if (isLoading) {
    return <PageLoader />;
  }
  if (!initialValues) redirect(`/workspaces/${workspaceId}`);
  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
