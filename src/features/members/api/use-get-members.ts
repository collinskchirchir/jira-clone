import { useQuery } from '@tanstack/react-query';
import { client } from '@/lib/rpc';

interface UseGetMembersProps {
  workspaceId: string;
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const query = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const response = await client.api.members.$get({ query: { workspaceId } });
      if (!response) throw new Error('Failed to fetch members');
      const json = await response.json();
      if ('error' in json) {
        throw new Error(json.error);
      }
      return json.data;

    },
  });
  return query;
};