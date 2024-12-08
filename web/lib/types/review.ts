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

// UI Components Props
export interface ReviewTabProps {
  completedReviews: Review[];
  pendingReviews: Review[];
}

export interface ReviewCardProps {
  review: Review;
  type: 'given' | 'received';
}

// Form Data Types
export interface ReviewFormData {
  rating: number;
  review: string;
}

export interface ReviewFormProps {
  serviceTitle: string;
  providerName: string;
  amount: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

// Blockchain Submission Type
export interface ReviewSubmitData extends ReviewFormData {
  reviewId: string;
  role: 'customer' | 'provider';
}
