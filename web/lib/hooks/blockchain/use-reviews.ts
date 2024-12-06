import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { PublicKey } from '@solana/web3.js';

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

export interface FormattedReview {
  id: string;
  rating: number;
  review: string;
  date: string; // We'll use the slot number for now
  reviewer: string;
  role: 'customer' | 'provider';
}

export interface UnreviewedChainService {
  id: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  role: 'customer' | 'provider';
  customer: PublicKey;
  serviceProvider: PublicKey;
}

export function useReviews() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ['reviews', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) return { reviews: [], unreviewedServices: [] };

      // Fetch all reviews from the program
      const reviews = await program.account.review.all();
      console.log('Fetched reviews:', reviews);

      // Filter and format reviews
      const formattedReviews = reviews
        .map((review: ChainReview) => {
          const isCustomer = review.account.customer.equals(publicKey);
          const isProvider = review.account.serviceProvider.equals(publicKey);

          // Skip if user is not involved in this review
          if (!isCustomer && !isProvider) return null;

          // For customer reviews
          if (isCustomer) {
            return {
              id: review.publicKey.toString(),
              rating: review.account.customerToProviderRating,
              review: review.account.customerToProviderReview,
              date: new Date().toISOString(), // TODO: Get actual timestamp from chain
              reviewer: review.account.customer.toString(),
              role: 'customer' as const,
              isCompleted: review.account.customerToProviderRating > 0,
            };
          }

          // For provider reviews
          return {
            id: review.publicKey.toString(),
            rating: review.account.providerToCustomerRating,
            review: review.account.providerToCustomerReview,
            date: new Date().toISOString(), // TODO: Get actual timestamp from chain
            reviewer: review.account.serviceProvider.toString(),
            role: 'provider' as const,
            isCompleted: review.account.providerToCustomerRating > 0,
          };
        })
        .filter(Boolean);

      // Split into completed and unreviewed
      const completedReviews = formattedReviews.filter((r) => r.isCompleted);
      const unreviewedServices = formattedReviews
        .filter((r) => !r.isCompleted)
        .map((r) => ({
          id: r.id,
          serviceTitle: `Service #${r.id.slice(0, 8)}`, // TODO: Fetch actual service title
          providerName: r.role === 'provider' ? r.reviewer : 'Unknown Provider', // TODO: Fetch actual names
          date: r.date,
          role: r.role,
        }));

      return {
        reviews: completedReviews,
        unreviewedServices,
      };
    },
    enabled: !!publicKey,
  });
}
