import * as fs from 'fs';

import { Program, workspace, setProvider, BN } from '@coral-xyz/anchor';

import {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';
import * as dotenv from 'dotenv';

import { TOKEN_PROGRAM_ID, createMint } from '@solana/spl-token';

import { Gigentic } from '../target/types/gigentic';

import { PROVIDER, SERVICE_REGISTRY_KEYPAIR } from '../tests/constants';

import * as bs58 from 'bs58';
dotenv.config();

// Configure the client to use the local cluster.
setProvider(PROVIDER);

// Initialize connection to the Solana network using the provided anchor provider
export const connection: Connection = PROVIDER.connection;

// Initialize the program
// const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const program: Program<Gigentic> =
  workspace.Gigentic as Program<Gigentic>;

// Load the "deployer" admin keypair which is used to deploy the program and create the service registry
const deployerKeypair = JSON.parse(
  fs.readFileSync(process.env.DEPLOYER_KEYPAIR_PATH as string, 'utf8'),
);
const deployer = Keypair.fromSecretKey(new Uint8Array(deployerKeypair));
console.log('deployer', deployer.publicKey.toString());

const serviceDeployer = Keypair.fromSecretKey(
  bs58.decode(process.env.SERVICE_DEPLOYER as string),
);

console.log('serviceDeployerKeypair', serviceDeployer.publicKey.toString());

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

    const feeAccount = deployer.publicKey;
    console.log('Fee Account Public Key:', feeAccount.toString());

    const feePercentage = 0;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 200000000; // Adjust the size based on the ServiceRegistry struct
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
    mint = await createMint(
      connection,
      deployer, // Fee deployer for the mint creation
      deployer.publicKey, // Mint authority that can mint new tokens
      deployer.publicKey, // Freeze authority (can be set to `null` to disable freezing)
      8, // Number of decimals for the mint (similar to a currency's smallest unit)
    );

    const serviceRegistryKeypair = SERVICE_REGISTRY_KEYPAIR;
    const descriptions = [
      'Leverage our AI agent for advanced data analysis, turning complex data into actionable insights for your business.',
      'Our AI-powered NLP solutions help you understand and interact with text and speech, improving communication and automation.',
      'Unlock the power of computer vision to automate image recognition, object detection, and visual data processing.',
      'Use our AI-driven predictive models to forecast trends, optimize operations, and make informed decisions.',
      'Maximize your system’s performance through AI agents trained with reinforcement learning, perfect for complex decision-making tasks.',
      'Automate customer support with AI chatbots, improving response times and customer satisfaction.',
      'Integrate our AI recommendation system for personalized user experiences and product suggestions.',
      'Analyze market trends with our AI-powered financial forecasting tool, ideal for investment decisions.',
      'Enhance security with AI-driven fraud detection and prevention systems.',
      'Streamline operations with AI-powered supply chain optimization and resource management.',
      'Leverage AI sentiment analysis to better understand customer feedback and improve services.',
      'Improve medical diagnostics with our AI healthcare analysis, offering faster and more accurate results.',
      'Utilize AI marketing automation to personalize campaigns and improve conversion rates.',
      'Boost efficiency with AI-driven robotic process automation (RPA) for repetitive tasks.',
      'SoleSec: A specialized AI agent built for auditing smart contracts on the Solana blockchain, ensuring code integrity and security.',
    ];

    const prices = [
      100, 200, 300, 400, 500, 150, 250, 350, 450, 600, 120, 220, 320, 420, 550,
    ];

    for (let i = 0; i < descriptions.length; i++) {
      await program.methods
        .initializeService(descriptions[i], new BN(prices[i]))
        .accounts({
          provider: serviceDeployer.publicKey,
          serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey,
          mint: mint,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([serviceDeployer]) // Include both deployer and the new service keypair as signers
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

async function main() {
  try {
    await initServiceRegistry();
    await createService();
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
