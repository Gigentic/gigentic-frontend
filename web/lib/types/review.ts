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

export interface ReviewSubmitData {
  reviewId: string;
  rating: number;
  review: string;
  role: 'customer' | 'provider';
}

export interface ReviewsData {
  completed: {
    given: Review[];
    received: Review[];
  };
  pending: {
    toGive: Review[];
    toReceive: Review[];
  };
}

export interface ReviewTabProps {
  completedReviews: Review[];
  pendingReviews: Review[];
  onReviewSubmit: (reviewData: ReviewSubmitData) => Promise<void>;
}
