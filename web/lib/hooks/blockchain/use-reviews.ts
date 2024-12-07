import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import {
  mockUnreviewedServicesReceived,
  mockUnreviewedServicesGiven,
  mockGivenReviews,
  mockReceivedReviews,
} from '@/components/review/mock-data';
import { Review, ReviewsData } from '@/types/review';

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
  return useQuery<ReviewsData>({
    queryKey: ['reviews-mock'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate error
      // throw new Error('Failed to fetch reviews from the blockchain');

      // Normal return data
      return {
        completed: {
          given: mockGivenReviews,
          received: mockReceivedReviews,
        },
        pending: {
          toGive: mockUnreviewedServicesGiven,
          toReceive: mockUnreviewedServicesReceived,
        },
      };
    },
  });
}

export function useReviews() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ['reviews', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) return [];

      const reviews = await program.account.review.all();

      return reviews
        .map((review) => {
          const isCustomer = review.account.customer.equals(publicKey);
          const isProvider = review.account.serviceProvider.equals(publicKey);

          if (!isCustomer && !isProvider) return null;

          return {
            ...review,
            serviceTitle: `Service #${review.publicKey.toString().slice(0, 8)}`,
            status:
              review.account.customerToProviderRating > 0
                ? 'completed'
                : 'pending',
            role: isCustomer ? 'customer' : 'provider',
          } as Review;
        })
        .filter(Boolean);
    },
    enabled: !!publicKey,
  });
}

export function filterReviews(
  reviews: Review[],
  options: {
    status?: 'pending' | 'completed';
    role?: 'customer' | 'provider';
  },
) {
  return reviews.filter((review) => {
    if (options.status && review.status !== options.status) return false;
    if (options.role && review.role !== options.role) return false;
    return true;
  });
}
