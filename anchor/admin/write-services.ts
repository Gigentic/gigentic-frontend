import * as dotenv from 'dotenv';
import * as fs from 'fs';

import { Program, workspace, setProvider } from '@coral-xyz/anchor';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';
import { PROVIDER } from '../tests/constants';
import { airdrop, loadKeypairBs58FromEnv } from '../tests/utils';
import { createTokenAccount } from './init';
import { createService } from './createService';
import { services } from './Services';

dotenv.config();

// Use cluster configured in local CLI environment
setProvider(PROVIDER);

// Initialize connection and program
const connection: Connection = PROVIDER.connection;
const program: Program<Gigentic> = workspace.Gigentic as Program<Gigentic>;

// Load service registry keypairs
const serviceRegistryDeployer = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_DEPLOYER_KEYPAIR',
);
console.log(
  'Service Registry Deployer Public Key:',
  serviceRegistryDeployer.publicKey.toString(),
);

const serviceRegistryKeypair = loadKeypairBs58FromEnv(
  'SERVICE_REGISTRY_KEYPAIR',
);
console.log(
  'Service Registry Keypair Public Key:',
  serviceRegistryKeypair.publicKey.toString(),
);

// Load service deployer keypair
const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER_KEYPAIR');
console.log(
  'Service Deployer Public Key:',
  serviceDeployer.publicKey.toString(),
);

async function main() {
  try {
    // console.log('========== Airdrop for Service Deployer ==========');
    // await airdrop(connection, serviceDeployer.publicKey);
    // console.log('Airdrop completed successfully.\n');
    // console.log('skip airdrop serviceDeployer');

    const data = fs.readFileSync('Token.json', 'utf-8');
    const parsedData = JSON.parse(data);
    const tokenMint = new PublicKey(parsedData.mintPublicKey);

    // Creating a token account
    const serviceProviderTokenAccount = await createTokenAccount(
      connection,
      serviceDeployer,
      tokenMint,
    );

    // Update Token.json with the service provider token account
    parsedData.serviceProviderTokenAccountPublicKey =
      serviceProviderTokenAccount;
    fs.writeFileSync('Token.json', JSON.stringify(parsedData, null, 2));

    console.log('========== Prepare Data and Create Services ==========');
    let index = 0;

    for (const service of services) {
      const description = `chatWalletAddress: ${service.chatWalletAddress} | title: ${service.title} | experience: ${service.experience} | price: ${service.price} ${service.currency} | avgRating: ${service.avgRating}`;
      console.log(
        `Creating service ${index + 1}/${services.length}: ${description}`,
      );

      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      await createService(
        serviceRegistryKeypair.publicKey,
        tokenMint,
        program,
        LAMPORTS_PER_SOL * service.price,
        description,
        uniqueId,
        serviceProviderTokenAccount,
      );
      index++;
    }

    console.log('========== Fetch Service Registry ==========');
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryKeypair.publicKey,
    );
    for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
      const serviceAccount =
        await program.account.service.fetch(serviceAddress);
      console.log(`Service Account Address: ${serviceAddress.toString()}`);
      console.log(`Service Account Description: ${serviceAccount.description}`);
      console.log(`Service Account Price: ${serviceAccount.price.toString()}`);
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
