import { TEST_SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program, connection } from './init';
import { fund_account } from './utils';
import * as anchor from '@coral-xyz/anchor';
import { SendTransactionError } from '@solana/web3.js';
import { expect } from 'chai';
import { TEST_SERVICE_DEPLOYERS, TEST_SERVICE_USERS } from './constants';

describe('Customer to provider review', () => {
  it('Gives the service review to the customer and checks if the review has the values assigned', async () => {
    // Select the customer from the predefined list of service users
    // The customer will be reviewing the service provided by the provider
    const customer = TEST_SERVICE_USERS[0];

    // Fund the customer's account with enough SOL to pay transaction fees
    await fund_account(connection, customer.publicKey);

    // Check the balance of the customer's account to ensure it has sufficient SOL for fees
    const customerBalance = await connection.getBalance(customer.publicKey);

    // Verify that the customer has at least 0.01 SOL in their account (for transaction fees)
    if (customerBalance < 0.01 * anchor.web3.LAMPORTS_PER_SOL) {
      throw new Error(
        'customer does not have enough SOL to pay transaction fees.',
      );
    }

    // Fetch the service registry account using the program and its public key.
    // The service registry holds references to the services deployed by providers.
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Retrieve the public key of the first service account from the service registry
    // This service account holds information about the service provided by the provider.
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details using the service account public key
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Define the rating (out of 5) and the review for the service provider
    const rating = 5;
    const review = 'Great service';

    try {
      await program.methods
        .customerToProviderRating(rating, review)
        .accounts({
          signer: customer.publicKey,
          review: serviceAccount.reviews[0],
        })
        .signers([customer])
        .rpc();
    } catch (err) {
      // Handle transaction errors
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError:', err.message);
      }
      throw err; // Re-throw the error to ensure the test fails
    }

    // Find the program address for the review account.
    // The review account stores the review and rating data linked to the service account.

    // Fetch the review account details using the generated program address
    const reviewAccount = await program.account.review.fetch(
      serviceAccount.reviews[0],
    );

    // Validate that the service provider stored in the review account matches the expected service provider
    expect(reviewAccount.serviceProvider.toBase58()).to.equal(
      TEST_SERVICE_DEPLOYERS[0].publicKey.toBase58(),
      'The service provider in the review account should match the service provider who owns the service.',
    );

    // Validate that the customer (customer) stored in the review account matches the customer who submitted the review
    expect(reviewAccount.customer.toBase58()).to.equal(
      customer.publicKey.toBase58(),
      'The customer in the review account should match the customer who submitted the review.',
    );

    // Validate that the rating given by the customer matches the rating stored in the review account
    expect(reviewAccount.customerToProviderRating).to.equal(
      rating,
      'The rating given by the customer should match the rating stored in the review account.',
    );

    // Validate that the review comment matches the comment stored in the review account
    expect(reviewAccount.customerToProviderReview).to.equal(
      review,
      'The review comment given by the customer should match the comment stored in the review account.',
    );
  });
});
