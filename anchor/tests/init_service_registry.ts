import { expect } from 'chai';
import {
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';
import { connection, program } from './init';
import {
  TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR,
  TEST_SERVICE_REGISTRY_KEYPAIR,
  TEST_FEE_ACCOUNT,
  SERVICE_REGISTRY_SPACE,
  FEE_PERCENTAGE,
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_USERS,
} from './constants';
import { getAccount } from '@solana/spl-token';
import { fund_account } from './utils';
import { feeTokenAccount, customerTokenAccount } from './init';

describe('Initialize Service Registry and checks for correct fee account and correct fee percentage', () => {
  before(async function () {
    // Fund necessary accounts
    await fund_account(
      connection,
      TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR.publicKey,
    );
    await fund_account(connection, TEST_SERVICE_DEPLOYERS[0].publicKey);
    await fund_account(connection, TEST_SERVICE_USERS[0].publicKey);
    await fund_account(connection, TEST_FEE_ACCOUNT.publicKey);

    // Calculate the minimum balance required for rent exemption for an account of a given size.
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(
        SERVICE_REGISTRY_SPACE,
      );

    // Prepare the parameters needed to create a new account on the Solana blockchain.
    const createAccountParams = {
      fromPubkey: TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: SERVICE_REGISTRY_SPACE, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };

    // Create a new transaction and add an instruction to create a new account.
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );

    // Send the transaction and wait for confirmation.
    // Both TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR and SERVICE_REGISTRY_KEYPAIR need to sign the transaction.
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR,
      TEST_SERVICE_REGISTRY_KEYPAIR,
    ]);
  });

  it('Initializes a service registry', async () => {
    // Call the 'initializeServiceRegistry' method on the program to initialize the service registry account.
    await program.methods
      .initializeServiceRegistry(
        TEST_FEE_ACCOUNT.publicKey,
        feeTokenAccount,
        FEE_PERCENTAGE,
      )
      .accounts({
        initializer: TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR.publicKey, // Account that initializes the registry
        serviceRegistry: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey, // The new service registry account being initialized
      })
      .signers([TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR]) // Sign the transaction with the deployer's keypair
      .rpc(); // Execute the Remote Procedure Call to perform the transaction

    // Fetch the service registry account data from the blockchain to validate its state.
    const fetchedRegistryAccount = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Validate that the service registry is initialized correctly.
    const expectedServiceAccountAddresses = []; // Expected initial state of service account addresses is empty.
    const actualServiceAccountAddresses =
      fetchedRegistryAccount.serviceAccountAddresses; // Actual state fetched from the blockchain.

    // Getting the actual fee account
    const actualFeeAccount = fetchedRegistryAccount.feeAccount;

    // Getting the actual Fee percentage
    const actualFeePercentage = fetchedRegistryAccount.feePercentage;

    // Getting the actual fee token account
    const actualFeeTokenAccount = fetchedRegistryAccount.feeTokenAccount;

    // Verify that the actual service account addresses match the expected initial state.
    expect(
      actualServiceAccountAddresses,
      'Service registry addresses do not match the expected addresses',
    ).to.deep.equal(expectedServiceAccountAddresses);

    // Verify that the actual fee account matches the expected fee account
    expect(actualFeeAccount.toBase58(), 'Fee account does not match').to.equal(
      TEST_FEE_ACCOUNT.publicKey.toBase58(),
    );

    // Verify that the actual fee token account matches the expected fee token account
    expect(
      actualFeeTokenAccount.toBase58(),
      'Fee token account does not match',
    ).to.equal(feeTokenAccount.toBase58());

    // Verify that the actual fee percentage matches the expected fee percentage
    expect(actualFeePercentage, 'Fee percentage does not match').to.equal(
      FEE_PERCENTAGE,
    );

    // Verify that the length of the service account addresses matches the expected length.
    expect(
      actualServiceAccountAddresses.length,
      'Service registry length does not match',
    ).to.equal(expectedServiceAccountAddresses.length);

    // Fetch the token balance of the buyerTokenAccount
    const buyerTokenAccountInfo = await getAccount(
      connection,
      customerTokenAccount,
    );

    // Verify that the buyerTokenAccount has the expected token balance
    const expectedTokenBalance = 1000000000; // Adjust the expected amount as needed
    const actualTokenBalance = buyerTokenAccountInfo.amount;

    expect(
      actualTokenBalance.toString(),
      'Buyer token account balance does not match',
    ).to.equal(expectedTokenBalance.toString());
  });
});

// Export the variables
