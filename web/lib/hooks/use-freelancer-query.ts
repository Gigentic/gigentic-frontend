import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Freelancer } from '../types/freelancer';

export const FREELANCER_KEYS = {
  selected: ['selectedFreelancer'] as const,
};

export function useSelectedFreelancer() {
  return useQuery<Freelancer>({
    queryKey: FREELANCER_KEYS.selected,
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      console.log(
        '📖 Attempting to read freelancer from cache with key:',
        FREELANCER_KEYS.selected,
      );
      console.log('📖 Found data:', data);
      return data;
    },
  });
}

export function useSelectFreelancer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (freelancer: Freelancer) => {
      console.log('📝 Starting mutation with freelancer:', freelancer);
      return Promise.resolve(freelancer);
    },
    onSuccess: (freelancer) => {
      console.log('✨ Setting freelancer in cache:', freelancer);
      console.log('🔑 Using query key:', FREELANCER_KEYS.selected);
      queryClient.setQueryData(FREELANCER_KEYS.selected, freelancer);
    },
  });
}
