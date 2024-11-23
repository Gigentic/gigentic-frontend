import * as anchor from '@coral-xyz/anchor';
import { expect } from 'chai';
import {
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_REGISTRY_KEYPAIR,
} from './constants';
import { program } from './init';
import { mint, serviceProviderTokenAccount } from './init';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

describe('Gigentic Service Deployment', () => {
  it('Initializes a service with correct description, price, and unique ID!', async () => {
    // Set up parameters for the test
    const deployerIndex = 0;

    // ANCHOR Generate a random unique ID for the service
    // const uniqueId = 'service_' + Math.random().toString(36).substring(2, 15);

    const uniqueId = '1';
    const description = 'Test description ';
    const price = new anchor.BN(1000);

    try {
      // Fetch the public key of the deployer
      const deployerPublicKey = TEST_SERVICE_DEPLOYERS[deployerIndex].publicKey;
      await program.methods
        .initializeService(uniqueId, description, price)
        .accounts({
          provider: deployerPublicKey,
          serviceRegistry: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
          mint: mint,
          serviceProviderTokenAccount: serviceProviderTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([TEST_SERVICE_DEPLOYERS[deployerIndex]])
        .rpc();
    } catch (error) {
      console.error('Failed to initialize service:', error); // Log an error message if service initialization fails
      throw error; // Re-throw the error to fail the test
    }

    // Fetch the service registry account data from the blockchain to verify the state after initialization
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Fetch the newly created service account data
    const serviceAccount = await program.account.service.fetch(
      serviceRegistry.serviceAccountAddresses[
        serviceRegistry.serviceAccountAddresses.length - 1
      ],
    );

    // Verify that the description of the service is set correctly
    expect(serviceAccount.description).to.equal(
      description,
      'The service description does not match the expected value.', // Error message if the assertion fails
    );

    // Verify that the price of the service is set correctly
    expect(serviceAccount.price.toString()).to.equal(
      price.toString(),
      'The service price does not match the expected value.', // Error message if the assertion fails
    );
  });

  it('Initializes a service with correct description and price! 2 ', async () => {
    // Set up parameters for the test
    const deployerIndex = 1; // Index of the service deployer to be used from the SERVICE_DEPLOYERS array
    const description = 'Test description1'; // Description for the new service to be deployed
    const price = new anchor.BN(2000); // Price of the new service, represented as a BigNumber
    const uniqueId = '2';
    // Deploy a new service to the service registry
    try {
      const deployerPublicKey = TEST_SERVICE_DEPLOYERS[deployerIndex].publicKey; // Fetch the public key of the deployer

      // Initialize a new service by calling the smart contract's method
      await program.methods
        .initializeService(uniqueId, description, price)
        .accounts({
          provider: deployerPublicKey,
          serviceRegistry: TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
          mint: mint,
          serviceProviderTokenAccount: serviceProviderTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([TEST_SERVICE_DEPLOYERS[deployerIndex]])
        .rpc();
    } catch (error) {
      console.error('Failed to initialize service:', error); // Log an error message if service initialization fails
    }

    // Fetch the service registry account data from the blockchain to verify the state after initialization
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Fetch the newly created service account data using its address from the registry
    const serviceAccount = await program.account.service.fetch(
      serviceRegistry.serviceAccountAddresses[deployerIndex], // Fetch the address of the deployed service using the deployer's index
    );

    // Verify that the description of the service is set correctly
    expect(serviceAccount.description).to.equal(
      description,
      'The service description does not match the expected value.', // Error message if the assertion fails
    );

    // Verify that the price of the service is set correctly
    expect(serviceAccount.price.toString()).to.equal(
      price.toString(),
      'The service price does not match the expected value.', // Error message if the assertion fails
    );
  });
});
