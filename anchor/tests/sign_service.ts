import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { program, connection } from './init';
import {
  TEST_SERVICE_REGISTRY_KEYPAIR,
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_USERS,
  TEST_FEE_ACCOUNT,
  FEE_PERCENTAGE,
} from './constants';
import { SendTransactionError } from '@solana/web3.js';

describe('SignService: Transfers money to the service provider and sends fees to the fee account', () => {
  it('Transfers money to the service provider and sends fees', async () => {
    // Select the buyer from the predefined service users
    const buyer = TEST_SERVICE_USERS[0];

    // Fetch the service registry account
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Get the public key of the service account from the registry
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    // Fetch the service account details
    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Find the program address for the escrow account
    const [escrowPubKey, escrowBump] = PublicKey.findProgramAddressSync(
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

    // Construct the transaction to sign the service
    const transaction = new anchor.web3.Transaction().add(
      await program.methods
        .signService()
        .accounts({
          signer: buyer.publicKey,
          service: serviceAccountPubKey,
          serviceProvider: TEST_SERVICE_DEPLOYERS[0].publicKey,
          feeAccount: TEST_FEE_ACCOUNT.publicKey,
        })
        .signers([buyer])
        .instruction(),
    );

    // Set the fee payer for the transaction
    transaction.feePayer = buyer.publicKey;

    // Get the balance of the service provider account before the transaction
    const balancebeforeServiceProviderAccount = await connection.getBalance(
      TEST_SERVICE_DEPLOYERS[0].publicKey,
    );

    // Get the balance of the fee account before the transaction
    const balancebeforeFeeAccount = await connection.getBalance(
      TEST_FEE_ACCOUNT.publicKey,
    );

    // Send and confirm the transaction
    try {
      const txSignature = await anchor.web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [buyer],
      );
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

    // Get the balance of the service provider account after the transaction
    const balanceAfterServiceProviderAccount = await connection.getBalance(
      TEST_SERVICE_DEPLOYERS[0].publicKey,
    );

    // Get the balance of the fee account after the transaction
    const balanceAfterFeeAccount = await connection.getBalance(
      TEST_FEE_ACCOUNT.publicKey,
    );

    // Check if the fee percentage is defined and assert the fee account balance increased
    if (FEE_PERCENTAGE) {
      expect(balanceAfterFeeAccount > balancebeforeFeeAccount).to.be.true;
    }

    // Assert the service provider account balance increased
    expect(
      balanceAfterServiceProviderAccount > balancebeforeServiceProviderAccount,
    ).to.be.true;
  });
});
