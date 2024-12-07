import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { PublicKey } from '@solana/web3.js';
import {
  mockUnreviewedServicesReceived,
  mockUnreviewedServicesGiven,
  mockGivenReviews,
  mockReceivedReviews,
} from '@/components/review/mock-data';
import { Review } from '@/lib/hooks/blockchain/use-reviews';

export function useReviewsV1() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ['reviews', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) return [];

      // Fetch all reviews from the program
      const reviews = await program.account.review.all();
      console.log('Fetched reviews:', reviews);

      return reviews;
    },
    enabled: !!publicKey,
  });
}

export function useReviewsFromMock() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      // Combine and format mock reviews
      const reviews = [
        ...mockUnreviewedServicesReceived,
        ...mockUnreviewedServicesGiven,
        ...mockGivenReviews,
        ...mockReceivedReviews,
      ];

      return reviews;
    },
  });
}
