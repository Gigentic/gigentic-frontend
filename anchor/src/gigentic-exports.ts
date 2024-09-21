// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import GigenticIDL from '../target/idl/gigentic.json';
import type { Gigentic } from '../target/types/gigentic';

// Re-export the generated IDL and type
export { Gigentic, GigenticIDL };

// The programId is imported from the program IDL.
export const GIGENTIC_PROGRAM_ID = new PublicKey(GigenticIDL.address);

// This is a helper function to get the Gigentic Anchor program.
export function getGigenticProgram(provider: AnchorProvider) {
  return new Program(GigenticIDL as Gigentic, provider);
}

// This is a helper function to get the program ID for the Gigentic program depending on the cluster.
export function getGigenticProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return GIGENTIC_PROGRAM_ID;
  }
}
