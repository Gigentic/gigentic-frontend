import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Freelancer } from '@/types/freelancer';

export const FREELANCER_KEYS = {
  selected: ['selectedFreelancer'] as const,
};

export function useSelectedFreelancer() {
  return useQuery<Freelancer>({
    queryKey: FREELANCER_KEYS.selected,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      return data;
    },
  });
}

export function useSelectFreelancer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (freelancer: Freelancer) => {
      return Promise.resolve(freelancer);
    },
    onSuccess: (freelancer) => {
      queryClient.setQueryData(FREELANCER_KEYS.selected, freelancer);
    },
  });
}
