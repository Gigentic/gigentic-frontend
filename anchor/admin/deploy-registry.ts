import * as fs from 'fs';
import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';

import { Program, workspace, setProvider, BN } from '@coral-xyz/anchor';

import {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';

import { TOKEN_PROGRAM_ID, createMint } from '@solana/spl-token';

import { Gigentic } from '../target/types/gigentic';

import { PROVIDER, SERVICE_REGISTRY_KEYPAIR } from '../tests/constants';

dotenv.config();

// Start of Selection
function loadSecrekeyFromEnv(envVarName: string): Keypair {
  console.log(`Loading secret key from environment variable: ${envVarName}`);
  const keypairPath = process.env[envVarName];
  if (!keypairPath) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }
  console.log(`Keypair path found: ${keypairPath}`);
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  console.log(`Keypair data loaded from ${keypairPath}`);
  const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
  console.log(
    `Keypair generated with public key: ${keypair.publicKey.toString()}`,
  );
  console.log('Public key of the keypair generated : ', keypair.publicKey);
  return keypair;
}

export function loadKeypairBs58FromEnv(envVarName: string): Keypair {
  console.log(
    `Loading keypair from bs58-encoded environment variable: ${envVarName}`,
  );
  const encodedKey = process.env[envVarName];
  if (!encodedKey) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }
  console.log(`Decoding bs58 keypair: ${encodedKey}`);
  const decodedKey = bs58.decode(encodedKey);

  // Create keypair directly from the decoded bytes
  const keypair = Keypair.fromSecretKey(decodedKey);

  console.log(
    `Keypair generated with public key: ${keypair.publicKey.toString()}`,
  );
  return keypair;
}
// Configure the client to use the local cluster.
setProvider(PROVIDER);

// Initialize connection to the Solana network using the provided anchor provider
export const connection: Connection = PROVIDER.connection;

// Initialize the program
export const program: Program<Gigentic> =
  workspace.Gigentic as Program<Gigentic>;

// Load the "programDeployer" admin keypair which is used to deploy the program and create the service registry
// const programDeployerKeypair = JSON.parse(
//   fs.readFileSync(DEPLOYER_KEYPAIR_PATH, 'utf8'),
// );

const programDeployer = loadKeypairBs58FromEnv('PROGRAM_DEPLOYER');
console.log('programDeployer', programDeployer.publicKey.toString());

// const programDeployer = Keypair.fromSecretKey(new Uint8Array(programDeployerKeypair));
// console.log('programDeployer', programDeployer.publicKey.toString());

const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');
console.log('serviceDeployer', serviceDeployer.publicKey.toString());

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

    const feeAccount = programDeployer.publicKey;
    console.log('Fee Account Public Key:', feeAccount.toString());

    const feePercentage = 0;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 2000000; // Adjust the size based on the ServiceRegistry struct
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(
        serviceRegistryAccountSize,
      );
    const createAccountParams = {
      fromPubkey: programDeployer.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: serviceRegistryKeypair.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: serviceRegistryAccountSize, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      programDeployer,
      serviceRegistryKeypair,
    ]);

    const transactionSignature = await program.methods
      .initializeServiceRegistry(feeAccount, feePercentage)
      .accounts({
        initializer: programDeployer.publicKey,
        serviceRegistry: serviceRegistryKeypair.publicKey,
      })
      .signers([programDeployer])
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

async function main() {
  try {
    await initServiceRegistry();
    // await createService();
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
