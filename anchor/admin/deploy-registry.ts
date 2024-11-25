import * as dotenv from 'dotenv';
import * as fs from 'fs'; // Import the fs module

import { Program, workspace, setProvider } from '@coral-xyz/anchor';
import {
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';
import { PROVIDER } from '../tests/constants';
import { airdrop, loadKeypairBs58FromEnv } from '../tests/utils';
import { createMintToken, createTokenAccount } from './init';

dotenv.config();

// Configure the client to use the local cluster
setProvider(PROVIDER);

// Initialize connection and program
const connection: Connection = PROVIDER.connection;
const program: Program<Gigentic> = workspace.Gigentic as Program<Gigentic>;

// Load service registry keypairs
const serviceRegistryDeployer = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_DEPLOYER_KEYPAIR',
);

const serviceRegistryKeypair = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_KEYPAIR',
);

console.log(
  'serviceRegistryDeployer',
  serviceRegistryDeployer.publicKey.toString(),
);
console.log('serviceRegistry', serviceRegistryKeypair.publicKey.toString());

async function initServiceRegistry() {
  try {
    const mint: PublicKey =
      (await createMintToken(connection, serviceRegistryDeployer)) ||
      new PublicKey(0); // Provide a default value or handle the error appropriately
    console.log('Mint Public Key:', mint.toString());

    const feeTokenAccount: PublicKey = await createTokenAccount(
      connection,
      serviceRegistryDeployer,
      mint,
    );

    // Create a JSON object to write to a file
    const output = {
      mintPublicKey: mint,
      feeTokenAccountPublicKey: feeTokenAccount,
    };
    fs.writeFileSync('Token.json', JSON.stringify(output, null, 2)); // Write to Token.json

    // Add the fee token account to the output
    output.feeTokenAccountPublicKey = feeTokenAccount; // Ensure this is included
    fs.writeFileSync('Token.json', JSON.stringify(output, null, 2)); // Write to Token.json again
    console.log('Fee Token Account Public Key:', feeTokenAccount.toString());

    const feeAccount = serviceRegistryDeployer.publicKey;
    console.log('Fee Account Public Key:', feeAccount.toString());

    const feePercentage = 1;
    console.log('Fee Percentage:', feePercentage);

    // Create the service registry account
    const serviceRegistryAccountSize = 2000; // Adjust the size based on the ServiceRegistry struct
    console.log('Service Registry Account Size: ', serviceRegistryAccountSize);

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
      .initializeServiceRegistry(feeAccount, feeTokenAccount, feePercentage)
      .accounts({
        initializer: serviceRegistryDeployer.publicKey,
        serviceRegistry: serviceRegistryKeypair.publicKey,
      })
      .signers([serviceRegistryDeployer])
      .rpc();
    console.log(`Transaction Signature: ${transactionSignature}`);

    console.log('');
    console.log(
      'Service Registry initialized successfully with address:\n',
      serviceRegistryKeypair.publicKey.toString(),
    );
  } catch (error) {
    console.error('Error initializing Service Registry:', error);
  }
}

async function main() {
  try {
    // console.log('========== Airdrop serviceRegistry deployer');
    // await airdrop(connection, serviceRegistryDeployer.publicKey);
    // console.log('skip airdrop serviceRegistryDeployer');
    // console.log('\n');

    console.log('========== Initialize service registry');
    await initServiceRegistry();
    console.log('\n');
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
