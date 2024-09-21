import { Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export const PROVIDER = anchor.AnchorProvider.env();
export const SERVICE_REGISTRY_SPACE = 10_000_000;

// SEEDS
// export const SOME_SEED: string = "some-registry";

// KEYPAIRS
export const REGISTRY_KEYPAIR = Keypair.generate();
export const MINT_AUTHORITY: Keypair = Keypair.generate();
export const SERVICE_REGISTRY_DEPLOYER = Keypair.generate();
export const SERVICE_REGISTRY_KEYPAIR = Keypair.generate();

export const FEE_PERCENTAGE = 0;
export const FEE_ACCOUNT = Keypair.generate();
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