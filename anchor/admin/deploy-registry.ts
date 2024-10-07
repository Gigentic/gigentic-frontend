// import * as fs from 'fs';
import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';
// import * as anchor from '@coral-xyz/anchor';

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
import { PROVIDER } from '../tests/constants';

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

// Load service registry keypairs
const serviceRegistryDeployer = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_DEPLOYER',
);
const serviceRegistryKeypair = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_KEYPAIR',
);
console.log(
  'serviceRegistryDeployer',
  serviceRegistryDeployer.publicKey.toString(),
);
console.log(
  'serviceRegistryKeypair',
  serviceRegistryKeypair.publicKey.toString(),
);

// Load service deployer keypair
const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');
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
    console.log('Initializing Service Registry...');

    const feeAccount = serviceRegistryDeployer.publicKey;
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
      fromPubkey: serviceRegistryDeployer.publicKey, // Account paying for the creation of the new account
      newAccountPubkey: serviceRegistryKeypair.publicKey, // Public key of the new account to be created
      lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
      space: serviceRegistryAccountSize, // Amount of space (in bytes) to allocate for the new account
      programId: program.programId, // The program that owns this account (in this case, the service registry program)
    };
    const createAccountTransaction = new Transaction().add(
      SystemProgram.createAccount(createAccountParams),
    );
    await sendAndConfirmTransaction(connection, createAccountTransaction, [
      serviceRegistryDeployer,
      serviceRegistryKeypair,
    ]);

    const transactionSignature = await program.methods
      .initializeServiceRegistry(feeAccount, feePercentage)
      .accounts({
        initializer: serviceRegistryDeployer.publicKey,
        serviceRegistry: serviceRegistryKeypair.publicKey,
      })
      .signers([serviceRegistryDeployer])
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
      serviceRegistryDeployer,
      serviceRegistryDeployer.publicKey,
      serviceRegistryDeployer.publicKey,
      8,
    );
    console.log('Mint token created:', mint.toString());
  } catch (error) {
    console.error('Error creating mint token:', error);
  }
}

async function main() {
  try {
    await airdrop(serviceRegistryDeployer.publicKey);
    console.log('========== Airdropped serviceRegistry deployer');
    console.log('\n');

    await initServiceRegistry();
    console.log('========== Initialized service registry');
    console.log('\n');

    await createMintToken();
    console.log('========== Created mint token');
    console.log('\n');

    await airdrop(serviceDeployer.publicKey);
    console.log('========== Airdropped service deployer');
    console.log('\n');
    for (let i = 0; i < services.length; i++) {
      // Update to use services array
      console.log(`Creating service ${i + 1}/${services.length}:`);
      await createService(
        serviceRegistryKeypair.publicKey,
        mint,
        program,
        services[i].price, // Use price from services
        services[i].description, // Use description from services
        i.toString(), // unique id
      );
    }
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryKeypair.publicKey,
    );
    console.log('XXX pubkey', serviceRegistryKeypair.publicKey.toString());
    console.log('XXX secretKey', serviceRegistryKeypair.secretKey.toString());

    console.log('serviceRegistry.feePercentage');
    console.log(serviceRegistry.feePercentage);

    for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
      console.log('Service Account Address:', serviceAddress.toString());

      const serviceAccount =
        await program.account.service.fetch(serviceAddress);
      // console.log('Service Account:', serviceAccount);
      // console.log('Service Account Unique ID:', serviceAccount.uniqueId);
      console.log('Service Account Description:', serviceAccount.description);
      console.log('Service Account Price:', serviceAccount.price.toString());
      // console.log('Service Account Mint:', serviceAccount.mint.toString());
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
