import { TEST_SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program } from './init';
import { SendTransactionError } from '@solana/web3.js';
import { expect } from 'chai';
import { TEST_SERVICE_DEPLOYERS } from './constants';

describe('Provider to customer review', () => {
  it('should correctly rate the customer through the service provider for review number 1', async () => {
    // Select the service provider from the predefined service deployers array
    // Assume the service provider is the first one in the SERVICE_DEPLOYERS array
    const serviceProvider = TEST_SERVICE_DEPLOYERS[0];

    // Fetch the service registry account from the program, using its public key.
    // This registry holds references to various service accounts.
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Retrieve the public key of the first service account from the service registry
    // Each service account is where reviews, ratings, and interactions are logged.
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details using the public key
    // This account holds data related to the service, such as service provider information.
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // The provider's rating for the customer (out of 5)
    const rating = 4;

    // The provider's review comment about the customer
    const review = 'Great Customer was very polite';

    // Set the fee payer for the transaction. The service provider will pay the fees.

    // Attempt to send and confirm the transaction on the Solana blockchain
    try {
      await program.methods
        .providerToCustomerRating(rating, review)
        .accounts({
          signer: serviceProvider.publicKey,
          review: serviceAccount.reviews[0],
        })
        .signers([serviceProvider])
        .rpc();
    } catch (err) {
      // Handle transaction errors
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError:', err.message);
      }
      throw err; // Re-throw the error to make the test fail
    }

    // Find the program address for the review account
    // This is where the review data (rating, comment) is stored for the specific service

    // Fetch the review account details using the program address
    const reviewAccount = await program.account.review.fetch(
      serviceAccount.reviews[0],
    );

    // Validate that the service provider for this review matches the expected service provider
    expect(reviewAccount.serviceProvider.toBase58()).to.equal(
      serviceAccount.provider.toBase58(),
      'The service provider in the review should match the service account provider.',
    );

    // Validate that the provider-to-customer rating in the review matches the rating that was submitted
    expect(reviewAccount.providerToCustomerRating).to.equal(
      rating,
      'The rating given by the provider should match the rating stored in the review account.',
    );

    // Validate that the provider's review comment matches the review stored in the account
    expect(reviewAccount.providerToCustomerReview).to.equal(
      review,
      'The review comment given by the provider should match the comment stored in the review account.',
    );
  });
  it('should correctly rate the customer through the service provider for review number 2', async () => {
    // Select the service provider from the predefined service deployers array
    // Assume the service provider is the first one in the SERVICE_DEPLOYERS array
    const serviceProvider = TEST_SERVICE_DEPLOYERS[0];

    // Fetch the service registry account from the program, using its public key.
    // This registry holds references to various service accounts.
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Retrieve the public key of the first service account from the service registry
    // Each service account is where reviews, ratings, and interactions are logged.
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details using the public key
    // This account holds data related to the service, such as service provider information.
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // The provider's rating for the customer (out of 5)
    const rating = 3;

    // The provider's review comment about the customer
    const review = 'Nice customer';

    // Set the fee payer for the transaction. The service provider will pay the fees.

    // Attempt to send and confirm the transaction on the Solana blockchain
    try {
      await program.methods
        .providerToCustomerRating(rating, review)
        .accounts({
          signer: serviceProvider.publicKey,
          review: serviceAccount.reviews[1],
        })
        .signers([serviceProvider])
        .rpc();
    } catch (err) {
      // Handle transaction errors
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError:', err.message);
      }
      throw err; // Re-throw the error to make the test fail
    }

    // Find the program address for the review account
    // This is where the review data (rating, comment) is stored for the specific service

    // Fetch the review account details using the program address
    const reviewAccount = await program.account.review.fetch(
      serviceAccount.reviews[1],
    );

    // Validate that the service provider for this review matches the expected service provider
    expect(reviewAccount.serviceProvider.toBase58()).to.equal(
      serviceAccount.provider.toBase58(),
      'The service provider in the review should match the service account provider.',
    );

    // Validate that the provider-to-customer rating in the review matches the rating that was submitted
    expect(reviewAccount.providerToCustomerRating).to.equal(
      rating,
      'The rating given by the provider should match the rating stored in the review account.',
    );

    // Validate that the provider's review comment matches the review stored in the account
    expect(reviewAccount.providerToCustomerReview).to.equal(
      review,
      'The review comment given by the provider should match the comment stored in the review account.',
    );
  });
});
