import * as fs from 'fs';
import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';
import * as anchor from '@coral-xyz/anchor';

import { Program, workspace, setProvider } from '@coral-xyz/anchor';

import {
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { services } from './Services'; // Import services from Services.ts
import { createMint } from '@solana/spl-token';

import { Gigentic } from '../target/types/gigentic';
import { PROVIDER, SERVICE_REGISTRY_KEYPAIR } from '../tests/constants';

import { createService } from './createService';
dotenv.config();

// Load bs58-encoded keypair from environment variable
export function loadKeypairBs58FromEnv(envVarName: string): Keypair {
  const encodedKey = process.env[envVarName];
  if (!encodedKey) throw new Error(`${envVarName} is not set`);
  return Keypair.fromSecretKey(bs58.decode(encodedKey));
}

// Configure the client to use the local cluster
setProvider(PROVIDER);

// Initialize connection and program
const connection: Connection = PROVIDER.connection;
const program: Program<Gigentic> = workspace.Gigentic as Program<Gigentic>;

// Load keypairs
const programDeployer = loadKeypairBs58FromEnv('PROGRAM_DEPLOYER');
const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');

console.log('programDeployer', programDeployer.publicKey.toString());
console.log('serviceDeployer', serviceDeployer.publicKey.toString());

let mint: PublicKey;

async function airdrop(deployer: PublicKey) {
  try {
    const airdropAmount = 3 * LAMPORTS_PER_SOL;
    const airdropSignature = await connection.requestAirdrop(
      deployer,
      airdropAmount,
    );
    await connection.confirmTransaction(airdropSignature, 'confirmed');
    console.log(
      `Airdropped ${airdropAmount / LAMPORTS_PER_SOL} SOL to ${deployer.toString()}`,
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

    const feePercentage = 0;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 20000; // Adjust the size based on the ServiceRegistry struct
    const rentExemptionAmount =
      await connection.getMinimumBalanceForRentExemption(
        serviceRegistryAccountSize,
      );
    console.log('Rent Exemption Amount: ', rentExemptionAmount);
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

async function createMintToken() {
  try {
    mint = await createMint(
      connection,
      programDeployer,
      programDeployer.publicKey,
      programDeployer.publicKey,
      8,
    );
    console.log('Mint token created:', mint.toString());
  } catch (error) {
    console.error('Error creating mint token:', error);
  }
}

async function main() {
  try {
    await airdrop(serviceDeployer.publicKey);
    await airdrop(programDeployer.publicKey);
    await initServiceRegistry();
    await createMintToken();

    for (let i = 0; i < services.length; i++) {
      // Update to use services array
      await createService(
        SERVICE_REGISTRY_KEYPAIR.publicKey,
        mint,
        program,
        services[i].price, // Use price from services
        services[i].description, // Use description from services
        i.toString(),
      );
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
