import { PublicKey } from '@solana/web3.js';
import { Review } from '@/lib/hooks/blockchain/use-reviews';

// Create dummy public keys
const ALICE = new PublicKey('7YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLA');
const PROVIDER_BOB = new PublicKey(
  '6XUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLB',
);
const PROVIDER_CAROL = new PublicKey(
  '5XUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLC',
);
const PROVIDER_DAVE = new PublicKey(
  '4XUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLD',
);
const CUSTOMER_EVE = new PublicKey(
  '3XUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLE',
);
const CUSTOMER_FRANK = new PublicKey(
  '2XUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLF',
);

// Alice's pending review (as customer)
export const mockUnreviewedServicesReceived: Review[] = [
  {
    publicKey: new PublicKey('3YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLD'),
    account: {
      reviewId: 'unreview-1',
      providerToCustomerRating: 0,
      customerToProviderRating: 0,
      customer: ALICE,
      serviceProvider: PROVIDER_DAVE,
      providerToCustomerReview: '',
      customerToProviderReview: '',
    },
    serviceTitle: 'Mobile App Development',
    status: 'pending',
    role: 'customer',
  },
];

// Alice's pending reviews to give (as provider)
export const mockUnreviewedServicesGiven: Review[] = [
  {
    publicKey: new PublicKey('1YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLG'),
    account: {
      reviewId: 'unreview-2',
      providerToCustomerRating: 0,
      customerToProviderRating: 0,
      customer: CUSTOMER_FRANK,
      serviceProvider: ALICE,
      providerToCustomerReview: '',
      customerToProviderReview: '',
    },
    serviceTitle: 'AI Chatbot Development',
    status: 'pending',
    role: 'provider',
  },
];

// Alice's completed reviews given as a customer
export const mockGivenReviews: Review[] = [
  {
    publicKey: new PublicKey('2YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLC'),
    account: {
      reviewId: '1',
      providerToCustomerRating: 4,
      customerToProviderRating: 5,
      customer: ALICE,
      serviceProvider: PROVIDER_BOB,
      providerToCustomerReview: 'Great client to work with!',
      customerToProviderReview:
        'Excellent web development service, highly recommended!',
    },
    serviceTitle: 'Web Development Service',
    status: 'completed',
    role: 'customer',
  },
  {
    publicKey: new PublicKey('1YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLB'),
    account: {
      reviewId: '2',
      providerToCustomerRating: 5,
      customerToProviderRating: 4,
      customer: ALICE,
      serviceProvider: PROVIDER_CAROL,
      providerToCustomerReview: 'Perfect communication and clear requirements',
      customerToProviderReview: 'Great design work, delivered on time!',
    },
    serviceTitle: 'UI/UX Design Service',
    status: 'completed',
    role: 'customer',
  },
];

// Reviews Alice has received as a provider
export const mockReceivedReviews: Review[] = [
  {
    publicKey: new PublicKey('0YUYeKJzxrQqmrp3YkwHBVv3pz9YWWVeM5YWjR7Z5iLA'),
    account: {
      reviewId: '3',
      providerToCustomerRating: 5,
      customerToProviderRating: 5,
      customer: CUSTOMER_EVE,
      serviceProvider: ALICE,
      providerToCustomerReview: 'Excellent customer, clear communication',
      customerToProviderReview:
        'Amazing AI development service, exceeded expectations!',
    },
    serviceTitle: 'Machine Learning Model Development',
    status: 'completed',
    role: 'provider',
  },
];
