import { PublicKey } from '@solana/web3.js';
import { IdlAccounts } from '@coral-xyz/anchor';
import { Gigentic } from '@gigentic-frontend/anchor/types';

// Define account types using IdlAccounts helper
export type ServiceAccount = IdlAccounts<Gigentic>['service'];
export type ReviewAccount = IdlAccounts<Gigentic>['review'];

// Helper types
export type Role = 'customer' | 'provider';
export type Status = 'pending' | 'completed';

// Basic chain review structure
export interface ChainReview {
  publicKey: PublicKey;
  account: ReviewAccount;
}

// UI wrapper for chain data
export interface Review extends ChainReview {
  status: Status;
  role: Role;
  serviceAccount: PublicKey;
  serviceTitle: string;
  serviceFee: number;
}

export interface ReviewsData {
  all: Review[];
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
  reviewText: string;
}

export interface ReviewFormProps {
  serviceTitle: string;
  providerAddress: string;
  amount: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
}

// Blockchain Submission Type
export interface ReviewSubmitData extends ReviewFormData {
  reviewId: string;
  role: Role;
  serviceAccount: PublicKey;
}
