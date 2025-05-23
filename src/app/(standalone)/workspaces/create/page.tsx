import React from 'react';
import { CreateWorkspaceForm } from '@/features/workspaces/components/create-workspace-form';
import { getCurrentSession } from '@/features/auth/auth-actions';
import { redirect } from 'next/navigation';

const WorkspaceCreatePage = async () => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');
  
  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspaceCreatePage;