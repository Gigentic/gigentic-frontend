import { Keypair, PublicKey } from '@solana/web3.js';
import { Review } from '@/types/review';

// Create dummy public keys
const ALICE = new PublicKey('7f6LTZcMxefrhyJssF7ws3DcQa56r4et6Vkni9BMbB9y');
const PROVIDER_BOB = new PublicKey(
  'DeqaHUuqjq8NPmJTa4bpUU2K9Y5dZ4zo3dk8SwjLC9FM',
);
const PROVIDER_CAROL = new PublicKey(
  'Exf9khM3cZHL3EyURNZwjTKqqMLeA1g52KStoZXBBPdb',
);
const PROVIDER_DAVE = new PublicKey(
  'ArkxEHUCMEu8rYoTbSnCTnht89EQvkHQAs1MUBex18r6',
);
const CUSTOMER_EVE = new PublicKey(
  '5T7eYscUF45wULNCKjZ9kkkJCNG3nzpAuEP3ZLo6brLk',
);
const CUSTOMER_FRANK = new PublicKey(
  'afdyHntf1uGNhfARcxzj9kmsC6xsGXTHo1QfbzahfDr',
);

// Alice's pending review (as customer)
export const mockUnreviewedServicesReceived: Review[] = [
  {
    publicKey: new Keypair().publicKey,
    account: {
      reviewId: 'unreview-1',
      providerToCustomerRating: 0,
      customerToProviderRating: 0,
      customer: ALICE,
      serviceProvider: PROVIDER_DAVE,
      providerToCustomerReview: '',
      customerToProviderReview: '',
    },
    status: 'pending',
    role: 'customer',
    serviceTitle: 'Mobile App Development',
    serviceAccount: new Keypair().publicKey,
    serviceFee: 1000000,
  },
];

// Alice's pending reviews to give (as provider)
export const mockUnreviewedServicesGiven: Review[] = [
  {
    publicKey: new Keypair().publicKey,
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
    serviceAccount: new Keypair().publicKey,
    serviceFee: 1000000,
  },
];

// Alice's completed reviews given as a customer
export const mockGivenReviews: Review[] = [
  {
    publicKey: new Keypair().publicKey,
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
    serviceAccount: new Keypair().publicKey,
    serviceFee: 1000000,
  },
  {
    publicKey: new Keypair().publicKey,
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
    serviceAccount: new Keypair().publicKey,
    serviceFee: 1000000,
  },
];

// Reviews Alice has received as a provider
export const mockReceivedReviews: Review[] = [
  {
    publicKey: new Keypair().publicKey,
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
    serviceAccount: new Keypair().publicKey,
    serviceFee: 1000000,
  },
];
