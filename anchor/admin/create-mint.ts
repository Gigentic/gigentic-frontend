import * as dotenv from 'dotenv';

import { setProvider } from '@coral-xyz/anchor';
import { createMint } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';

import { PROVIDER } from '../tests/constants';
import { loadKeypairBs58FromEnv } from '../tests/utils';

dotenv.config();

// Configure the client to use the local cluster
setProvider(PROVIDER);

// Initialize connection and program
const connection: Connection = PROVIDER.connection;

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
console.log(
  'serviceRegistryKeypair',
  serviceRegistryKeypair.publicKey.toString(),
);

let mint: PublicKey;

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
    console.log('========== Create mint token');
    await createMintToken();
    console.log('\n');
  } catch (error) {
    console.error('Error in main execution:', error);
  }
}

// Run the main function
main();
