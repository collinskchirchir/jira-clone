import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  image: z.union([
    z.instanceof(File),
    z.string().transform((value) => value === '' ? undefined : value)
      .optional(),
  ]),
  workspaceId: z.string(),
});

export const createProjectFormSchema = createProjectSchema.omit({
  workspaceId: true,
});
export type CreateProjectFormType = z.infer<typeof createProjectFormSchema>