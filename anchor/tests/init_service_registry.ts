import { expect } from 'chai';
import { before } from 'mocha';
import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { connection, program } from './init';
import {
  SERVICE_REGISTRY_DEPLOYER,
  SERVICE_REGISTRY_SPACE,
  FEE_ACCOUNT,
  FEE_PERCENTAGE,
  SERVICE_REGISTRY_KEYPAIR,
} from './constants';

describe('Initialize Service Registry and checks for correct fee_account and correct fee percentage ', () => {
  before(async function () {
    // Calculate the minimum balance required for rent exemption for an account of a given size.
    // This prevents the account from being deleted due to insufficient balance.
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(
        SERVICE_REGISTRY_SPACE,
      );

    // Prepare the parameters needed to create a new account on the Solana blockchain.
    const createAccountParams = {
      fromPubkey: SERVICE_REGISTRY_DEPLOYER.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: SERVICE_REGISTRY_KEYPAIR.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: SERVICE_REGISTRY_SPACE, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };

    // Create a new transaction and add an instruction to create a new account.
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );

    // Send the transaction and wait for confirmation.
    // Both SERVICE_REGISTRY_DEPLOYER and SERVICE_REGISTRY_KEYPAIR need to sign the transaction.
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      SERVICE_REGISTRY_DEPLOYER,
      SERVICE_REGISTRY_KEYPAIR,
    ]);
  });

  it('initializes a service registry', async () => {
    // Call the 'initializeServiceRegistry' method on the program to initialize the service registry account.
    await program.methods
      .initializeServiceRegistry(FEE_ACCOUNT.publicKey, FEE_PERCENTAGE) //  sets the fee_Account owner to the deployer, and for now sets the initial fee to 0
      .accounts({
        initializer: SERVICE_REGISTRY_DEPLOYER.publicKey, // Account that initializes the registry
        serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey, // The new service registry account being initialized
      })
      .signers([SERVICE_REGISTRY_DEPLOYER]) // Sign the transaction with the deployer's keypair
      .rpc(); // Execute the Remote Procedure Call to perform the transaction

    // Fetch the service registry account data from the blockchain to validate its state.
    const fetchedRegistryAccount = await program.account.serviceRegistry.fetch(
      SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Validate that the service registry is initialized correctly.
    const expectedServiceAccountAddresses = []; // Expected initial state of service account addresses is empty.
    const actualServiceAccountAddresses =
      fetchedRegistryAccount.serviceAccountAddresses; // Actual state fetched from the blockchain.

    // Getting the actual fee account
    const actualFeeAccount = fetchedRegistryAccount.feeAccount;

    // Getting the actual Fee percentage
    const actualFeePercentage = fetchedRegistryAccount.feePercentage;

    // Verify that the actual service account addresses match the expected initial state.
    expect(
      actualServiceAccountAddresses,
      'Service registry addresses do not match the expected addresses',
    ).to.deep.equal(expectedServiceAccountAddresses);

    // Verify that the actual fee account matches the expected fee account
    expect(actualFeeAccount.toBase58(), 'Fee account does not match').to.equal(
      FEE_ACCOUNT.publicKey.toBase58(),
    );

    // verify that the actual fee percentage matches the expected fee percentage
    expect(actualFeePercentage, 'Fee percentage does not match').to.equal(
      FEE_PERCENTAGE,
    );

    // Verify that the length of the service account addresses matches the expected length.
    expect(
      actualServiceAccountAddresses.length,
      'Service registry length does not match',
    ).to.equal(expectedServiceAccountAddresses.length);
  });
});
