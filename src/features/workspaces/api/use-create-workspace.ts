import { client } from '@/lib/rpc';
import { InferRequestType, InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';


type ResponseType = InferResponseType<typeof client.api.workspaces['$post']>

type RequestType = InferRequestType<typeof client.api.workspaces['$post']>

export const useLogin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.workspaces.$post({ json });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
  return mutation;
};
