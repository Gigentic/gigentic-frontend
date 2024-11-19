import { TEST_SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program, connection } from './init';
import { fund_account } from './utils';
import * as anchor from '@coral-xyz/anchor';
import { SendTransactionError } from '@solana/web3.js';
import { expect } from 'chai';
import { TEST_SERVICE_DEPLOYERS, TEST_SERVICE_USERS } from './constants';

describe('Customer to agent review', () => {
  it('Gives the service review to the customer and checks if the review has the values assigned', async () => {
    // Select the buyer (consumer) from the predefined list of service users
    // The buyer will be reviewing the service provided by the agent
    const buyer = TEST_SERVICE_USERS[0];

    // Fund the buyer's account with enough SOL to pay transaction fees
    await fund_account(connection, buyer.publicKey);

    // Check the balance of the buyer's account to ensure it has sufficient SOL for fees
    const buyerBalance = await connection.getBalance(buyer.publicKey);

    // Verify that the buyer has at least 0.01 SOL in their account (for transaction fees)
    if (buyerBalance < 0.01 * anchor.web3.LAMPORTS_PER_SOL) {
      throw new Error(
        'Buyer does not have enough SOL to pay transaction fees.',
      );
    }

    // Fetch the service registry account using the program and its public key.
    // The service registry holds references to the services deployed by agents.
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Retrieve the public key of the first service account from the service registry
    // This service account holds information about the service provided by the agent.
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details using the service account public key
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Define the rating (out of 5) and the review for the service provider
    const rating = 5;
    const review = 'Great service';

    try {
      await program.methods
        .consumerToAgentRating(rating, review)
        .accounts({
          signer: buyer.publicKey,
          review: serviceAccount.reviews[0],
        })
        .signers([buyer])
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

    // Validate that the consumer (buyer) stored in the review account matches the buyer who submitted the review
    expect(reviewAccount.consumer.toBase58()).to.equal(
      buyer.publicKey.toBase58(),
      'The consumer in the review account should match the buyer who submitted the review.',
    );

    // Validate that the rating given by the consumer matches the rating stored in the review account
    expect(reviewAccount.consumerToAgentRating).to.equal(
      rating,
      'The rating given by the consumer should match the rating stored in the review account.',
    );

    // Validate that the review comment matches the comment stored in the review account
    expect(reviewAccount.customerToAgentReview).to.equal(
      review,
      'The review comment given by the consumer should match the comment stored in the review account.',
    );
  });
});
