import { Gigentic } from '../target/types/gigentic';
import { Program, setProvider } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey, // Correctly placed import
} from '@solana/web3.js';
import { createMint } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import * as fs from 'fs';

import {
  PROVIDER,
  SERVICE_DEPLOYERS,
  SERVICE_REGISTRY_KEYPAIR,
  DEPLOYER_KEYPAIR_PATH,
} from '../tests/constants';

// Initialize the program
export const connection: Connection = PROVIDER.connection;
setProvider(PROVIDER);

export const program: Program<Gigentic> = anchor.workspace
  .Gigentic as Program<Gigentic>;

// Load the keypair
const keypairData = JSON.parse(fs.readFileSync(DEPLOYER_KEYPAIR_PATH, 'utf8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

let mint: PublicKey;

async function initServiceRegistry() {
  try {
    // Generate a new Keypair for the service registry
    const serviceRegistryKeypair = SERVICE_REGISTRY_KEYPAIR;
    console.log(
      'Generated new Keypair for Service Registry:',
      serviceRegistryKeypair.publicKey.toString(),
    );

    console.log('Initializing Service Registry...');

    const feeAccount = payer.publicKey;
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
      fromPubkey: payer.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: serviceRegistryKeypair.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: serviceRegistryAccountSize, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      payer,
      serviceRegistryKeypair,
    ]);

    const transactionSignature = await program.methods
      .initializeServiceRegistry(feeAccount, feePercentage)
      .accounts({
        initializer: payer.publicKey,
        serviceRegistry: serviceRegistryKeypair.publicKey,
      })
      .signers([payer])
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
    mint = await createMint(
      connection,
      payer, // Fee payer for the mint creation
      payer.publicKey, // Mint authority that can mint new tokens
      payer.publicKey, // Freeze authority (can be set to `null` to disable freezing)
      8, // Number of decimals for the mint (similar to a currency's smallest unit)
    );

    const serviceRegistryKeypair = SERVICE_REGISTRY_KEYPAIR;
    const descriptions = [
      'Leverage our AI agent for advanced data analysis, turning complex data into actionable insights for your business.',
      'Our AI-powered NLP solutions help you understand and interact with text and speech, improving communication and automation.',
      'Unlock the power of computer vision to automate image recognition, object detection, and visual data processing.',
      'Use our AI-driven predictive models to forecast trends, optimize operations, and make informed decisions.',
      'Maximize your system’s performance through AI agents trained with reinforcement learning, perfect for complex decision-making tasks.',
    ];
    const price = [100, 200, 300, 400, 500];

    for (let i = 0; i < 1; i++) {
      await program.methods
        .initializeService(descriptions[i], new anchor.BN(price[i]))
        .accounts({
          provider: SERVICE_DEPLOYERS[0].publicKey,
          serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey,
          mint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([SERVICE_DEPLOYERS[0]]) // Include both payer and the new service keypair as signers
        .rpc();
    }

    const serviceRegistry = await program.account.serviceRegistry.fetch(
      SERVICE_REGISTRY_KEYPAIR.publicKey,
    );
    console.log('Service Registry:', serviceRegistry);

    for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
      const serviceAccount =
        await program.account.service.fetch(serviceAddress);
      console.log('Service Account:', serviceAccount);
      console.log('Service Account Address:', serviceAddress.toString());
      console.log('Service Account Description:', serviceAccount.description);
      console.log('Service Account Price:', serviceAccount.price.toString());
      console.log('Service Account Mint:', serviceAccount.mint.toString());
    }
  } catch (error) {
    console.error('Error creating service:', error);
  }
}

async function airdropSolToFirstDeployer() {
  try {
    const deployer = SERVICE_DEPLOYERS[0];
    const airdropSignature = await connection.requestAirdrop(
      deployer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL, // Airdrop 2 SOL
    );
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    console.log(`Airdropped 2 SOL to ${deployer.publicKey.toString()}`);
  } catch (error) {
    console.error('Error airdropping SOL to the first deployer:', error);
  }
}

async function main() {
  try {
    // await airdropSolToFirstDeployer(); // Airdrop SOL to the first deployer
    await initServiceRegistry();
    // await createService();
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
