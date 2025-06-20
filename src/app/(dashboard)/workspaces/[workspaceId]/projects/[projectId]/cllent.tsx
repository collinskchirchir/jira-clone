'use client';

import React from 'react';
import { PencilIcon } from 'lucide-react';
import ProjectAvatar from '@/features/projects/components/project-avatar';
import { useProjectId } from '@/features/projects/hooks/use-project-id';
import { useGetProject } from '@/features/projects/api/use-get-project';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PageLoader } from '@/components/page-loader';
import { PageError } from '@/components/page-error';
import { TaskViewSwitcher } from '@/features/tasks/components/task-view-switcher';

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: isLoadingProject } = useGetProject({ projectId });
  if (isLoadingProject) return (<PageLoader />);
  if (!project) return (<PageError message="Project not found" />);
  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            name={project.name}
            image={project.imageUrl}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div>
          <Button
            variant="secondary"
            size="sm"
            asChild
          >
            <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
              <PencilIcon className="mr-2 size-4" />
              Edit Project
            </Link>
          </Button>
        </div>
      </div>
      <TaskViewSwitcher />
    </div>
  );
};