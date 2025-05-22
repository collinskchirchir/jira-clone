// import { z } from 'zod';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadFile } from 'better-upload/client';


type ResponseType = InferResponseType<typeof client.api.workspaces['$post']>
type RequestType = InferRequestType<typeof client.api.workspaces['$post']>

export const useCreateWorkspace = () => {
  const queryClient = useQueryClient();

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadFile({
        file,
        route: 'workspaceImage',
        api: '/api/upload/workspace-image',
        onFileStateChange: ({ file }) => {
          // you handle the progress of the file
          console.log(file);
        },
      });
    },
  });

  // Workspace creation mutation
  const createMutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      // Handle file upload if present
      if (form.image instanceof File) {
        // 1. Upload the file
        const uploadResult = await uploadMutation.mutateAsync(form.image);

        // 2. Extract the fileId from the result
        const fileId = uploadResult.metadata.fileId as string;

        // 3. Create a new form object with the fileId replacing the File object
        const updatedForm = {
          ...form,
          image: fileId, // Replace File with the fileId string
        };

        // 4. Send the request with updated form data
        const response = await client.api.workspaces.$post({
          form: updatedForm,
        });

        return response.json();
      }

      // If the image is already a string or not present, send directly
      const response = await client.api.workspaces.$post({ form });
      return response.json();
    },
    onSuccess: () => {
      toast.success('Workspace created');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error) => {
      console.error('Workspace creation error:', error);
      toast.error('Failed to create workspace');
    },
  });

  return {
    ...createMutation,
    uploadMutation,
    isPending: createMutation.isPending || uploadMutation.isPending,
    isUploading: uploadMutation.isPending,
    isCreating: createMutation.isPending && !uploadMutation.isPending,
  };
};