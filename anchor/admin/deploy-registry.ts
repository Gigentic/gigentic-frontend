import * as fs from 'fs';

import { Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import {
  clusterApiUrl,
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';

import {
  SERVICE_DEPLOYERS,
  SERVICE_REGISTRY_KEYPAIR,
  DEPLOYER_KEYPAIR_PATH,
} from '../tests/constants';

// Initialize the program
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const program: Program<Gigentic> = anchor.workspace
  .Gigentic as Program<Gigentic>;

// Load the "deployer" admin keypair which is used to deploy the program and create the service registry
const deployerKeypair = JSON.parse(
  fs.readFileSync(DEPLOYER_KEYPAIR_PATH, 'utf8'),
);
const deployer = Keypair.fromSecretKey(new Uint8Array(deployerKeypair));
console.log('deployer', deployer.publicKey.toString());

async function initServiceRegistry() {
  try {
    // Generate a new Keypair for the service registry
    const serviceRegistryKeypair = SERVICE_REGISTRY_KEYPAIR;
    console.log(
      'Generated new Keypair for Service Registry:',
      serviceRegistryKeypair.publicKey.toString(),
    );

    console.log('Initializing Service Registry...');

    const feeAccount = deployer.publicKey;
    console.log('Fee Account Public Key:', feeAccount.toString());

    const feePercentage = 0;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 200; // Adjust the size based on the ServiceRegistry struct
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(
        serviceRegistryAccountSize,
      );
    const createAccountParams = {
      fromPubkey: deployer.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: serviceRegistryKeypair.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: serviceRegistryAccountSize, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      deployer,
      serviceRegistryKeypair,
    ]);

    const transactionSignature = await program.methods
      .initializeServiceRegistry(feeAccount, feePercentage)
      .accounts({
        initializer: deployer.publicKey,
        serviceRegistry: serviceRegistryKeypair.publicKey,
      })
      .signers([deployer])
      .rpc();
    console.log(`Transaction Signature: ${transactionSignature}`);

    const fetchedRegistryAccount = await program.account.serviceRegistry.fetch(
      serviceRegistryKeypair.publicKey,
    );

    console.log('Fetched Service Registry account:', fetchedRegistryAccount);
    console.log(
      'Service Registry fee account:',
      fetchedRegistryAccount.feeAccount.toString(),
    );
    console.log(
      'Service Registry fee percentage:',
      fetchedRegistryAccount.feePercentage,
    );
    console.log(
      'Service Registry service account addresses:',
      fetchedRegistryAccount.serviceAccountAddresses,
    );

    console.log('Service Registry initialized successfully!');
    console.log(
      'Service Registry address:',
      serviceRegistryKeypair.publicKey.toString(),
    );
  } catch (error) {
    console.error('Error initializing Service Registry:', error);
  }
}

async function createService() {
  try {
    const deployerIndex = 0; // Index of the service deployer to be used from the SERVICE_DEPLOYERS array

    const serviceRegistryKeypair = SERVICE_REGISTRY_KEYPAIR;
    const descriptions = [
      'Leverage our AI agent for advanced data analysis, turning complex data into actionable insights for your business.',
      'Our AI-powered NLP solutions help you understand and interact with text and speech, improving communication and automation.',
      'Unlock the power of computer vision to automate image recognition, object detection, and visual data processing.',
      'Use our AI-driven predictive models to forecast trends, optimize operations, and make informed decisions.',
      'Maximize your system’s performance through AI agents trained with reinforcement learning, perfect for complex decision-making tasks.',
    ];
    const price = [100, 200, 300, 400, 500];
    const deployerPublicKey = SERVICE_DEPLOYERS[deployerIndex].publicKey; // Fetch the public key of the deployer
    const mint = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
    const TOKEN_PROGRAM_ID = new PublicKey(
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Fix the string to be a valid PublicKey
    );
    for (let i = 0; i < 1; i++) {
      await program.methods
        .initializeService(descriptions[i], new anchor.BN(price[i])) // Fix typo: description -> descriptions
        .accounts({
          provider: deployerPublicKey, // Deployer account that provides the service
          serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey, // The service registry account where the service will be registered
          mint: mint, // Mint account for token-based transactions
          tokenProgram: TOKEN_PROGRAM_ID, // SPL Token Program ID for handling token transactions
        })
        .signers([SERVICE_DEPLOYERS[deployerIndex]]) // Sign the transaction with the deployer's keypair
        .rpc();
    }
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      SERVICE_REGISTRY_KEYPAIR.publicKey,
    );
    console.log('Service Registry:', serviceRegistry);
    for (let i = 0; i < 1; i++) {
      const serviceAccount = await program.account.service.fetch(
        serviceRegistry.serviceAccountAddresses[i],
      );
      console.log('Service Account:', serviceAccount);
      console.log(
        'Service Account Address:',
        serviceRegistry.serviceAccountAddresses[i],
      );
      console.log('Service Account Description:', serviceAccount.description);
      console.log('Service Account Price:', serviceAccount.price.toString());
      console.log('Service Account Mint:', serviceAccount.mint);
    }
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  try {
    await initServiceRegistry();
    // await createService();
    // console.log('DEPLOYER_KEYPAIR_PATH', DEPLOYER_KEYPAIR_PATH);
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
