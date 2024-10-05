import { AnchorProvider } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Keypair } from '@solana/web3.js';

export const PROVIDER = AnchorProvider.env();
export const SERVICE_REGISTRY_SPACE = 10_000_000;

// SERVICE_REGISTRY account
export const SERVICE_REGISTRY_KEYPAIR = Keypair.generate();
export const FEE_ACCOUNT = Keypair.generate();
export const FEE_PERCENTAGE = 0;
export const AIRDROP_SOL_AMOUNT = 10; // Amount in SOL
export const AIRDROP_LAMPORTS = AIRDROP_SOL_AMOUNT * LAMPORTS_PER_SOL;

// KEYPAIRS
export const REGISTRY_KEYPAIR = Keypair.generate();
export const MINT_AUTHORITY: Keypair = Keypair.generate();
export const SERVICE_REGISTRY_DEPLOYER = Keypair.generate();

export const SERVICE_DEPLOYERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

export const SERVICE_USERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

// SEEDS
// export const SOME_SEED: string = "some-registry";
