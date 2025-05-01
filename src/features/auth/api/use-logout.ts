import { client } from '@/lib/rpc';
import { InferResponseType } from 'hono';
import { useMutation, useQueryClient } from '@tanstack/react-query';


type ResponseType = InferResponseType<typeof client.api.auth.logout['$post']>

export const useLogout = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const response = await client.api.auth.logout.$post();
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current'] });
    },
  });
  return mutation;
};
