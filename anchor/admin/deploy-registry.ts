import * as dotenv from 'dotenv';
  
import { Program, workspace, setProvider } from '@coral-xyz/anchor';

import {
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';
import { PROVIDER } from '../tests/constants';
import { loadKeypairBs58FromEnv, airdrop } from '../tests/utils';

dotenv.config();

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

async function initServiceRegistry() {
  try {
    // console.log('Initializing Service Registry...');

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
    console.log('========== Airdrop serviceRegistry deployer');
    await airdrop(connection, serviceRegistryDeployer.publicKey);
    console.log('\n');

    console.log('========== Initialize service registry');
    await initServiceRegistry();
    console.log('\n');

    console.log('========== Read service registry');
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryKeypair.publicKey,
    );

    for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
      console.log('Service Account Address:', serviceAddress.toString());

      const serviceAccount =
        await program.account.service.fetch(serviceAddress);
      // console.log('Service Account Unique ID:', serviceAccount.uniqueId);
      console.log('Service Account Description:', serviceAccount.description);
      console.log('Service Account Price:', serviceAccount.price.toString());
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
