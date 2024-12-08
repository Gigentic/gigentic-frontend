import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { ReviewsData, ChainReview, Review, Role, Status } from '@/types/review';
import { PublicKey } from '@solana/web3.js';

import {
  mockUnreviewedServicesReceived,
  mockUnreviewedServicesGiven,
  mockGivenReviews,
  mockReceivedReviews,
} from '@/components/review/mock-data';

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

// Helper function to transform ChainReview into Review with UI fields
function transformChainReview(
  review: ChainReview,
  publicKey: PublicKey,
): Review {
  const role = determineRole(review, publicKey);
  const status = determineStatus(review, role);

  return {
    ...review,
    serviceTitle: 'Service Title', // TODO: Implement actual service title
    status,
    role,
  };
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
function categorizeReviews(reviews: ChainReview[], publicKey: PublicKey) {
  // First filter for only reviews involving the current user
  const relevantReviews = reviews.filter((review) =>
    isUserInvolved(review, publicKey),
  );

  console.log(
    `Filtered ${reviews.length} total reviews down to ${relevantReviews.length} relevant reviews`,
  );

  const categorized = {
    completed: {
      given: [] as Review[],
      received: [] as Review[],
    },
    pending: {
      toGive: [] as Review[],
      toReceive: [] as Review[],
    },
  };

  relevantReviews.forEach((review) => {
    const transformed = transformChainReview(review, publicKey);
    const isCustomer = review.account.customer.equals(publicKey);

    if (isCustomer) {
      if (review.account.customerToProviderRating !== 0) {
        // Customer has given rating
        categorized.completed.given.push(transformed);
      } else {
        // Customer needs to give rating
        categorized.pending.toGive.push(transformed);
      }

      if (review.account.providerToCustomerRating !== 0) {
        // Customer has received rating
        categorized.completed.received.push(transformed);
      } else {
        // Customer waiting for rating
        categorized.pending.toReceive.push(transformed);
      }
    } else {
      // Provider cases
      if (review.account.providerToCustomerRating !== 0) {
        // Provider has given rating
        categorized.completed.given.push(transformed);
      } else {
        // Provider needs to give rating
        categorized.pending.toGive.push(transformed);
      }

      if (review.account.customerToProviderRating !== 0) {
        // Provider has received rating
        categorized.completed.received.push(transformed);
      } else {
        // Provider waiting for rating
        categorized.pending.toReceive.push(transformed);
      }
    }
  });

  return categorized;
}

export function useReviews() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();

  return useQuery<ReviewsData>({
    queryKey: ['reviews', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected');

      // Fetch all reviews from the program
      const reviews = await program.account.review.all();
      console.log(`Fetched ${reviews.length} raw reviews`);

      // Process all reviews through the categorization helper
      const transformedData = categorizeReviews(reviews, publicKey);

      console.log('Transformed review data:', transformedData);
      return transformedData;
    },
    enabled: !!publicKey && !!program,
  });
}

// TODO: Used on program page. Remove this when all reviews work
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
