import * as dotenv from 'dotenv';

import { Program, workspace, setProvider } from '@coral-xyz/anchor';

import {
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// import { TOKEN_PROGRAM_ID, createMint } from '@solana/spl-token';

import { Gigentic } from '../target/types/gigentic';
import {
  AIRDROP_LAMPORTS,
  FEE_PERCENTAGE,
  PROVIDER,
  SERVICE_REGISTRY_KEYPAIR,
} from '../tests/constants';
import { loadKeypairBs58FromEnv } from '../tests/utils';

dotenv.config();

// Configure the client to use the local cluster
setProvider(PROVIDER);

// Initialize connection to the Solana network using the provided anchor provider
export const connection: Connection = PROVIDER.connection;

// Initialize the program
export const program: Program<Gigentic> =
  workspace.Gigentic as Program<Gigentic>;

console.log('connection', connection.rpcEndpoint);
console.log('programId', program.programId.toString());

// Load the "programDeployer" admin keypair which is used to deploy the program and create the service registry
const programDeployer = loadKeypairBs58FromEnv('PROGRAM_DEPLOYER');
console.log('programDeployer', programDeployer.publicKey.toString());

const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');
console.log('serviceDeployer', serviceDeployer.publicKey.toString());

async function airdrop(deployer: PublicKey) {
  try {
    const airdropSignature = await connection.requestAirdrop(
      deployer,
      AIRDROP_LAMPORTS,
    );
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    console.log(
      `Airdropped ${AIRDROP_LAMPORTS / LAMPORTS_PER_SOL} SOL to ${deployer.toString()}`,
    );
  } catch (error) {
    console.error('Error airdropping SOL:', error);
  }
}

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

    const feePercentage = FEE_PERCENTAGE;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 2000; // Adjust the size based on the ServiceRegistry struct
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
    await Promise.all([
      airdrop(programDeployer.publicKey),
      airdrop(serviceDeployer.publicKey),
    ]);
    await initServiceRegistry();
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
