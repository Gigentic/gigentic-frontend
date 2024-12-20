'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCluster } from '@/cluster/cluster-data-access';
import {
  ReviewsData,
  ChainReview,
  Review,
  ServiceAccount,
  Role,
  Status,
} from '@/types/review';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { useGigenticProgram } from './use-gigentic-program';
import { useServiceRegistry } from './use-service-registry';
import { extractServiceTitle } from './use-service-account';

import {
  mockUnreviewedServicesReceived,
  mockUnreviewedServicesGiven,
  mockGivenReviews,
  mockReceivedReviews,
} from '@/components/review/mock-data';

export function useReviews() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();
  const { serviceAccounts } = useServiceRegistry();

  return useQuery<ReviewsData>({
    queryKey: ['reviews', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');
      if (!serviceAccounts.data) throw new Error('Service accounts not loaded');

      // Fetch all reviews from the program
      const reviews = await program.account.review.all();
      // console.log(`Fetched ${reviews.length} raw reviews`);

      // Process all reviews through the categorization helper
      const transformedData = categorizeReviews(
        reviews,
        publicKey,
        serviceAccounts.data,
      );

      console.log('Transformed review data:', transformedData);
      return transformedData;
    },
    enabled: !!publicKey && !!program && !!serviceAccounts.data,
  });
}

// Helper function to determine role
function determineRole(review: ChainReview, publicKey: PublicKey): Role {
  const isCustomer = review.account.customer.equals(publicKey);
  const isProvider = review.account.serviceProvider.equals(publicKey);

  if (isCustomer && isProvider) {
    console.warn(
      'User is both customer and provider for review:',
      review.account.reviewId,
    );
    return 'customer'; // Default to customer in edge case
  }
  if (isCustomer) return 'customer';
  if (isProvider) return 'provider';
  throw new Error(
    `Invalid state: User ${publicKey.toString()} is neither customer nor provider`,
  );
}

// Helper function to determine review status based on role
function determineStatus(review: ChainReview, role: Role): Status {
  return role === 'customer' // User is Customer
    ? review.account.customerToProviderRating === 0
      ? 'pending' // Customer hasn't rated yet
      : 'completed' // Customer has rated
    : // User is Provider
      review.account.providerToCustomerRating === 0
      ? 'pending' // Provider hasn't rated yet
      : 'completed'; // Provider has rated
}

// Helper function to find service account details for a review
function findServiceDetailsForReview(
  review: ChainReview,
  services: { publicKey: PublicKey; account: ServiceAccount }[],
): { serviceAccount?: PublicKey; serviceFee: number; serviceTitle: string } {
  const matchingService = services.find(({ account }) =>
    account.reviews.some((r: PublicKey) => r.equals(review.publicKey)),
  );

  return {
    serviceAccount: matchingService?.publicKey,
    serviceFee: matchingService?.account.price
      ? matchingService.account.price / LAMPORTS_PER_SOL
      : -1,
    serviceTitle: matchingService
      ? extractServiceTitle(matchingService.account.description)
      : 'Unnamed Service',
  };
}

// Helper function to transform ChainReview into Review with UI fields
function transformChainReview(
  review: ChainReview,
  publicKey: PublicKey,
  services: { publicKey: PublicKey; account: ServiceAccount }[],
): Review | null {
  const role = determineRole(review, publicKey);
  const status = determineStatus(review, role);
  try {
    const { serviceAccount, serviceFee, serviceTitle } =
      findServiceDetailsForReview(review, services);
    if (!serviceAccount) {
      // console.warn(
      //   `Service account not found for review ${review.account.reviewId}`,
      // );
      return null;
    }

    return {
      ...review,
      status,
      role,
      serviceTitle,
      serviceAccount,
      serviceFee,
    };
  } catch (error) {
    console.error(
      `Error transforming review ${review.account.reviewId}:`,
      error,
    );
    throw error;
  }
}

// Helper function to check if a user is involved in a review
function isUserInvolved(review: ChainReview, publicKey: PublicKey): boolean {
  const isCustomer = review.account.customer.equals(publicKey);
  const isProvider = review.account.serviceProvider.equals(publicKey);

  // Filter out self-reviews where user is both customer and provider
  if (isCustomer && isProvider) {
    console.warn('Filtered out self-review:', review.account.reviewId);
    return false;
  }

  return isCustomer || isProvider;
}

// Helper function to categorize reviews by all edge cases
function categorizeReviews(
  reviews: ChainReview[],
  publicKey: PublicKey,
  services: { publicKey: PublicKey; account: ServiceAccount }[],
) {
  // First filter for only reviews involving the current user
  const relevantReviews = reviews.filter((review) =>
    isUserInvolved(review, publicKey),
  );

  console.log(
    `Filtered ${reviews.length} total reviews down to ${relevantReviews.length} relevant reviews`,
  );

  const categorized = {
    all: [] as Review[],
  };

  relevantReviews.forEach((review) => {
    const transformed = transformChainReview(review, publicKey, services);
    if (!transformed) return; // Skip if service account not found

    categorized.all.push(transformed);
  });

  return categorized;
}

// TODO: Used on program page. Remove this when all reviews work
// export function useReviewsFromMock() {
//   return useQuery<ReviewsData>({
//     queryKey: ['reviews-mock'],
//     queryFn: async () => {
//       // Simulate network delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Simulate error
//       // throw new Error('Failed to fetch reviews from the blockchain');

//       // Normal return data
//       return {
//         completed: {
//           given: mockGivenReviews,
//           received: mockReceivedReviews,
//         },
//         pending: {
//           toGive: mockUnreviewedServicesGiven,
//           toReceive: mockUnreviewedServicesReceived,
//         },
//       };
//     },
//   });
// }

// TODO: Used on program page. Remove this when all reviews work
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
