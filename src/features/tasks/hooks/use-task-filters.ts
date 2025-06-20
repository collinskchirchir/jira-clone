import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { TaskStatus } from '@/features/tasks/task-types';

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    assigneeId: parseAsString,
    search: parseAsString,
    dueDate: parseAsString,
  });
};