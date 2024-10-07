import { TEST_SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program, connection } from './init';
// import { fund_account } from './utils';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { SendTransactionError } from '@solana/web3.js';
import { expect } from 'chai';
import { TEST_SERVICE_DEPLOYERS } from './constants';

describe('Agent to customer review', () => {
  it('Rates the customer through the service provider and checks if the values are initialized correctly', async () => {
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

    // The agent's rating for the consumer (out of 5)
    const rating = 4;

    // The agent's review comment about the consumer
    const review = 'Great Consumer was very polite';

    // Create a transaction to record the agent's rating and review for the consumer.
    // This calls the `agentToConsumerRating` method in the Solana program and passes the
    // necessary parameters: the rating and review.
    const transaction = new anchor.web3.Transaction().add(
      await program.methods
        .agentToConsumerRating(rating, review)
        .accounts({
          signer: serviceProvider.publicKey, // The service provider signs the transaction
          service: serviceAccountPubKey, // The service account being reviewed
        })
        .instruction(),
    );

    // Set the fee payer for the transaction. The service provider will pay the fees.
    transaction.feePayer = serviceProvider.publicKey;

    // Attempt to send and confirm the transaction on the Solana blockchain
    try {
      const txSignature = await anchor.web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [serviceProvider], // The service provider is the signer
      );
    } catch (err) {
      // Handle transaction errors
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError:', err.message);
        // If there's an error, retrieve and log the transaction's logs for debugging
        // const logs = await err.getLogs(connection);
        // console.error('Transaction Logs:', logs);
      }
      throw err; // Re-throw the error to make the test fail
    }

    // Find the program address for the review account
    // This is where the review data (rating, comment) is stored for the specific service
    const [reviewPubKey] = PublicKey.findProgramAddressSync(
      [Buffer.from('review_service'), serviceAccountPubKey.toBuffer()], // Seed for address generation
      program.programId, // Program ID to tie it to
    );

    // Fetch the review account details using the program address
    const reviewAccount = await program.account.review.fetch(reviewPubKey);

    // Validate that the service provider for this review matches the expected service provider
    expect(reviewAccount.serviceProvider.toBase58()).to.equal(
      serviceAccount.provider.toBase58(),
      'The service provider in the review should match the service account provider.',
    );

    // Validate that the agent-to-consumer rating in the review matches the rating that was submitted
    expect(reviewAccount.agentToConsumerRating).to.equal(
      rating,
      'The rating given by the agent should match the rating stored in the review account.',
    );

    // Validate that the agent's review comment matches the review stored in the account
    expect(reviewAccount.agentToCustomerReview).to.equal(
      review,
      'The review comment given by the agent should match the comment stored in the review account.',
    );
  });
});
