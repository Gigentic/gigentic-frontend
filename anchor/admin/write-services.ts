import * as dotenv from 'dotenv';

import { Program, workspace, setProvider } from '@coral-xyz/anchor';
import { createMint } from '@solana/spl-token';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';
import { PROVIDER } from '../tests/constants';
import { airdrop, loadKeypairBs58FromEnv } from '../tests/utils';

import { createService } from './createService';
import { services } from './Services'; // Import services from Services.ts
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
const mintKeypair = loadKeypairBs58FromEnv('MINT_KEYPAIR');
const mint = mintKeypair.publicKey;

console.log(
  'serviceRegistryDeployer',
  serviceRegistryDeployer.publicKey.toString(),
);
console.log(
  'serviceRegistryKeypair',
  serviceRegistryKeypair.publicKey.toString(),
);
console.log('mint', mint.toString());

// Load service deployer keypair
const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER_KEYPAIR');
console.log('serviceDeployer', serviceDeployer.publicKey.toString());

async function main() {
  try {
    console.log('========== Airdrop service deployer');
    // await airdrop(connection, serviceDeployer.publicKey);
    console.log('skip airdrop serviceDeployer');
    console.log('\n');

    console.log('========== Prepare data and Create services');
    console.log('\n');

    let index = 0;

    for (const service of services) {
      const description = `title: ${service.title} | description: ${service.description}`;
      console.log(description);

      // Update to use services array
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      console.log(
        `Creating service ${index + 1}/${services.length} with ID ${uniqueId}:`,
      );
      await createService(
        serviceRegistryKeypair.publicKey,
        mint,
        program,
        LAMPORTS_PER_SOL * service.price,
        description,
        uniqueId,
      );
      index++;
    }

    console.log('========== Fetch service registry');
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryKeypair.publicKey,
    );

    for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
      console.log('Service Account Address:', serviceAddress.toString());

      const serviceAccount =
        await program.account.service.fetch(serviceAddress);
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
