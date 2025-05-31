import React from 'react';
import { getCurrentSession } from '@/features/auth/auth-queries';
import { redirect } from 'next/navigation';
import { ProjectIdClient } from '@/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/cllent';

interface ProjectIdProps {
  params: { projectId: string };
}

const ProjectIdPage = async ({ params }: ProjectIdProps) => {
  const user = await getCurrentSession();
  if (!user) redirect('/sign-in');

  return <ProjectIdClient />;
};

export default ProjectIdPage;