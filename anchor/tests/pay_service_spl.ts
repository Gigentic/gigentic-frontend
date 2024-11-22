import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { program, connection } from './init';
import {
  TEST_SERVICE_REGISTRY_KEYPAIR,
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_USERS,
} from './constants';
import { buyerTokenAccount, tokenMint } from './init_service_registry';
import { REVIEW_ID_2 } from './constants';
import { SendTransactionError } from '@solana/web3.js';
import { getAccount, createAccount, mintTo } from '@solana/spl-token';
import { fund_account } from './utils';

describe('Gigentic Service Buying', () => {
  before(async function () {
    // Ensure the buyer's token account is created and funded
    const buyer = TEST_SERVICE_USERS[0];
    await fund_account(connection, buyer.publicKey);
  });

  it('Checks if the service is paid correctly and escrow has the values supposed', async () => {
    const buyer = TEST_SERVICE_USERS[0];

    // Fetch the service registry account
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Get the public key of the service account from the registry
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account's data
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Create the transaction to pay for the service
    const transaction = new anchor.web3.Transaction().add(
      await program.methods
        .payServiceSpl(REVIEW_ID_2)
        .accounts({
          buyer: buyer.publicKey,
          service: serviceAccountPubKey,
          serviceRegistry: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
          buyerTokenAccount: buyerTokenAccount,
          mint: tokenMint,
        })
        .signers([buyer])
        .instruction(),
    );
    transaction.feePayer = buyer.publicKey;

    // Send and confirm the transaction
    try {
      const txSignature = await anchor.web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [buyer],
      );
    } catch (err) {
      if (err instanceof SendTransactionError) {
        // const logs = await err.getLogs(connection);
        console.error('Transaction Logs:', err);
      }
      throw err;
    }

    // Verify the escrow account state
    const [escrowPubKey] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('escrow'),
        serviceAccountPubKey.toBuffer(),
        serviceAccount.provider.toBuffer(),
        buyer.publicKey.toBuffer(),
      ],
      program.programId,
    );
    const escrowAccount = await program.account.escrow.fetch(escrowPubKey);

    expect(escrowAccount.expectedAmount.toString()).to.equal(
      serviceAccount.price.toString(),
      'Escrow account expected amount should match the service price',
    );

    // Verify the escrow token account balance
    const [escrow_token_pkey] = PublicKey.findProgramAddressSync(
      [Buffer.from('escrow-token-account'), escrowPubKey.toBuffer()],
      program.programId,
    );

    const escrowTokenAccount = await getAccount(connection, escrow_token_pkey);

    expect(escrowTokenAccount.amount.toString()).to.equal(
      serviceAccount.price.toString(),
      'Escrow token account balance should match the service price',
    );
    const expectedAmount = serviceAccount.price;
    expect(
      escrowAccount.expectedAmount.toString(),
      'Escrow account expected amount should match the service price',
    ).to.equal(expectedAmount.toString());
    const expectedBuyer = buyer.publicKey.toBase58();
    expect(
      escrowAccount.buyer.toBase58(),
      'Escrow account buyer should match the buyer public key',
    ).to.equal(expectedBuyer);
    const expectedServiceProvider =
      TEST_SERVICE_DEPLOYERS[0].publicKey.toBase58();

    expect(
      escrowAccount.serviceProvider.toBase58(),
      "Escrow account service provider should match the service deployer's public key",
    ).to.equal(expectedServiceProvider);
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

    // const review = await program.account.review.fetch(
    //   serviceAccount.reviews[0],
    // );
    const service = await program.account.service.fetch(serviceAccountPubKey);
    const review = await program.account.review.fetch(service.reviews[0]);

    expect(review.reviewId, 'Review number should match').to.equal(REVIEW_ID_2);

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
