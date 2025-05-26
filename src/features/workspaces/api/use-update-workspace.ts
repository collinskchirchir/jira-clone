// import { z } from 'zod';
import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadFile } from 'better-upload/client';


type ResponseType = InferResponseType<typeof client.api.workspaces[':workspaceId']['$patch'], 200>
type RequestType = InferRequestType<typeof client.api.workspaces[':workspaceId']['$patch']>

export const useUpdateWorkspace = () => {
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
  const updateMutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
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
        const response = await client.api.workspaces[':workspaceId'].$patch({
          form: updatedForm, param,
        });

        if (!response.ok) {
          throw new Error('Failed to update workspace');
        }

        return response.json() as Promise<ResponseType>;
      }

      // If the image is already a string or not present, send directly
      const response = await client.api.workspaces[':workspaceId'].$patch({ form, param });
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      return response.json() as Promise<ResponseType>;
    },
    onSuccess: ({ data }) => {
      toast.success('Workspace updated');
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces', data.$id] });
    },
    onError: (error) => {
      console.error('Workspace creation error:', error);
      toast.error('Failed to update workspace');
    },
  });

  return {
    ...updateMutation,
    uploadMutation,
    isPending: updateMutation.isPending || uploadMutation.isPending,
    isUploading: uploadMutation.isPending,
    isUpdating: updateMutation.isPending && !uploadMutation.isPending,
  };
};