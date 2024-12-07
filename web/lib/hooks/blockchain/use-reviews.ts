import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { PublicKey } from '@solana/web3.js';

// Basic chain review structure
export interface ChainReview {
  publicKey: PublicKey;
  account: {
    reviewId: string;
    providerToCustomerRating: number;
    customerToProviderRating: number;
    customer: PublicKey;
    serviceProvider: PublicKey;
    providerToCustomerReview: string;
    customerToProviderReview: string;
  };
}

// UI wrapper for chain data
export interface Review extends ChainReview {
  serviceTitle: string;
  status: 'pending' | 'completed';
  role: 'customer' | 'provider';
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
