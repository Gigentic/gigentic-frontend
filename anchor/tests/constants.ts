import { AnchorProvider } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export const REVIEW_ID = '1';
export const PROVIDER = AnchorProvider.env();
export const SERVICE_REGISTRY_SPACE = 10_000_000;
export const SERVICE_REGISTRY_SPACE_SMALL = 1000;

// SERVICE_REGISTRY account
export const TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR = Keypair.generate();
export const TEST_SERVICE_REGISTRY_KEYPAIR = Keypair.generate();
export const TEST_FEE_ACCOUNT = Keypair.generate();
export const FEE_PERCENTAGE = 1;
export const AIRDROP_SOL_AMOUNT = 1000; // Amount in SOL
export const AIRDROP_LAMPORTS = AIRDROP_SOL_AMOUNT * LAMPORTS_PER_SOL;

// KEYPAIRS
// export const REGISTRY_KEYPAIR = Keypair.generate();
export const MINT_AUTHORITY: Keypair = Keypair.generate();

// SERVICE DEPLOYERS
export const TEST_SERVICE_DEPLOYERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

export const TEST_SERVICE_USERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

// SEEDS
// export const SOME_SEED: string = "some-registry";
