import { TEST_SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program, connection } from './init';
import { fund_account } from './utils';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { SendTransactionError } from '@solana/web3.js';
import { expect } from 'chai';
import {
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_USERS,
  REVIEW_NO,
} from './constants';

describe('Gigentic Service Buying', () => {
  it('Checks if the service is paid correctly and escrow has the correct values', async () => {
    // Select the buyer from the predefined service users
    const buyer = TEST_SERVICE_USERS[0];

    // Fund the buyer's account
    await fund_account(connection, buyer.publicKey);
    const buyerBalance = await connection.getBalance(buyer.publicKey);

    // Check if the buyer has enough SOL to pay transaction fees
    if (buyerBalance < 0.01 * anchor.web3.LAMPORTS_PER_SOL) {
      throw new Error(
        'Buyer does not have enough SOL to pay transaction fees.',
      );
    }

    // Fetch the service registry account
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Get the public key of the service account from the registry
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Create a transaction to pay for the service
    const transaction = new anchor.web3.Transaction().add(
      await program.methods
        .payService(REVIEW_NO)
        .accounts({
          buyer: buyer.publicKey,
          service: serviceAccountPubKey,
          serviceRegistry: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
        })
        .instruction(),
    );

    // Set the fee payer for the transaction
    transaction.feePayer = buyer.publicKey;

    // Send and confirm the transaction
    try {
      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        buyer,
      ]);
    } catch (err) {
      // Handle transaction errors
      if (err instanceof SendTransactionError) {
        console.error('SendTransactionError:', err.message);
        // If there's an error, retrieve and log the transaction's logs for debugging
        // const logs = await err.getLogs(connection);
        // console.error('Transaction Logs:', logs);
      }
      throw err;
    }

    // Find the program address for the escrow account
    const [escrowPubKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('escrow'),
        serviceAccountPubKey.toBuffer(),
        serviceAccount.provider.toBuffer(),
        buyer.publicKey.toBuffer(),
      ],
      program.programId,
    );

    // Fetch the escrow account details
    const escrowAccount = await program.account.escrow.fetch(escrowPubKey);

    // Check if the escrow account has the expected amount (service price)
    const expectedAmount = serviceAccount.price;
    expect(
      escrowAccount.expectedAmount.toString(),
      'Escrow account expected amount should match the service price',
    ).to.equal(expectedAmount.toString());

    // Check if the escrow account has the correct buyer
    const expectedBuyer = buyer.publicKey.toBase58();
    expect(
      escrowAccount.buyer.toBase58(),
      'Escrow account buyer should match the buyer public key',
    ).to.equal(expectedBuyer);

    // Check if the escrow account has the correct service provider
    const expectedServiceProvider =
      TEST_SERVICE_DEPLOYERS[0].publicKey.toBase58();
    expect(
      escrowAccount.serviceProvider.toBase58(),
      "Escrow account service provider should match the service deployer's public key",
    ).to.equal(expectedServiceProvider);

    // Check if the escrow account has the correct fee account
    const expectedFeeAccount = serviceRegistry.feeAccount.toBase58();
    expect(
      escrowAccount.feeAccount.toBase58(),
      "Escrow account fee account should match the service registry's fee account",
    ).to.equal(expectedFeeAccount);

    // Check if the escrow account has the correct fee percentage
    const expectedFeePercentage = serviceRegistry.feePercentage;
    expect(
      escrowAccount.feePercentage.toString(),
      "Escrow account fee percentage should match the service registry's fee percentage",
    ).to.equal(expectedFeePercentage.toString());

    const service = await program.account.service.fetch(serviceAccountPubKey);

    const review = await program.account.review.fetch(service.reviews[0]);

    expect(review.reviewNo, 'Review number should match').to.equal(REVIEW_NO);

    expect(
      review.agentToConsumerRating,
      'Agent to consumer rating should be 0',
    ).to.equal(0);

    expect(
      review.consumerToAgentRating,
      'Consumer to agent rating should be 0',
    ).to.equal(0);

    expect(
      review.agentToCustomerReview,
      'Agent to customer review should be empty',
    ).to.equal('');

    expect(
      review.customerToAgentReview,
      'Customer to agent review should be empty',
    ).to.equal('');

    expect(service.reviews.length, 'Service should have 1 review').to.equal(1);
  });
});
