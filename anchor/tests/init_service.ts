import * as anchor from '@coral-xyz/anchor';
import { expect } from 'chai';
import { SERVICE_DEPLOYERS, SERVICE_REGISTRY_KEYPAIR } from './constants';
import { program, mint } from './init';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

describe('Gigentic Service Deployment', () => {
  it('Initializes a service with correct description and price!', async () => {
    // Set up parameters for the test
    const deployerIndex = 0; // Index of the service deployer to be used from the SERVICE_DEPLOYERS array
    const description = 'Test description'; // Description for the new service to be deployed
    const price = new anchor.BN(1000); // Price of the new service, represented as a BigNumber

    // Deploy a new service to the service registry
    try {
      const deployerPublicKey = SERVICE_DEPLOYERS[deployerIndex].publicKey; // Fetch the public key of the deployer

      // Initialize a new service by calling the smart contract's method
      await program.methods
        .initializeService(description, price) // Method to initialize a new service
        .accounts({
          provider: deployerPublicKey, // Deployer account that provides the service
          serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey, // The service registry account where the service will be registered
          mint: mint, // Mint account for token-based transactions
          tokenProgram: TOKEN_PROGRAM_ID, // SPL Token Program ID for handling token transactions
        })
        .signers([SERVICE_DEPLOYERS[deployerIndex]]) // Sign the transaction with the deployer's keypair
        .rpc(); // Execute the remote procedure call to interact with the blockchain
    } catch (error) {
      console.error('Failed to initialize service:', error); // Log an error message if service initialization fails
    }

    // Fetch the service registry account data from the blockchain to verify the state after initialization
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      SERVICE_REGISTRY_KEYPAIR.publicKey,
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
