import { Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

// export const DEPLOYER_KEYPAIR_PATH = '/home/calc1f4r/.config/solana/id.json'; // TODO: could get this automatically from solana config
export const DEPLOYER_KEYPAIR_PATH = '/Users/marci/.config/solana/id.json'; // TODO: could get this automatically from solana config
export const SERVICE_DEPLOYER =
  'Dyn2GhUEvZUBG6r4G7Mh5skK9k77cDuGNRLNewmc2QJdnQy6ocPdNWDwLhBU71o45gfZVufZ3gbiZUCHo5Pokib';

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
