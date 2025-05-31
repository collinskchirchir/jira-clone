import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadFile } from 'better-upload/client';


type ResponseType = InferResponseType<typeof client.api.projects[':projectId']['$patch'], 200>;
type RequestType = InferRequestType<typeof client.api.projects[':projectId']['$patch']>;

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return uploadFile({
        file,
        route: 'projectImage',
        api: '/api/upload/project-image',
        onFileStateChange: ({ file }) => {
          // you handle the progress of the file
          console.log(file);
        },
      });
    },
  });

  // Project creation mutation
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
        const response = await client.api.projects[':projectId'].$patch({
          form: updatedForm,
          param,
        });
        if (!response.ok) {
          throw new Error('Failed to update project');
        }

        return response.json();
      }

      // If the image is already a string or not present, send directly
      const response = await client.api.projects[':projectId'].$patch({ form, param });
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      return response.json();
    },
    onSuccess: ({ data }) => {
      toast.success('Project updated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', data.$id] });
    },
    onError: (error) => {
      console.error('Project updating error:', error);
      toast.error('Failed to update project');
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