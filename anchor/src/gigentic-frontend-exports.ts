// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import GigenticFrontendIDL from '../target/idl/gigentic_frontend.json';
import type { GigenticFrontend } from '../target/types/gigentic_frontend';

// Re-export the generated IDL and type
export { GigenticFrontend, GigenticFrontendIDL };

// The programId is imported from the program IDL.
export const GIGENTIC_FRONTEND_PROGRAM_ID = new PublicKey(
  GigenticFrontendIDL.address
);

// This is a helper function to get the GigenticFrontend Anchor program.
export function getGigenticFrontendProgram(provider: AnchorProvider) {
  return new Program(GigenticFrontendIDL as GigenticFrontend, provider);
}

// This is a helper function to get the program ID for the GigenticFrontend program depending on the cluster.
export function getGigenticFrontendProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return GIGENTIC_FRONTEND_PROGRAM_ID;
  }
}
