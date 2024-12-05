import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface EscrowAccount {
  customer: PublicKey;
  serviceProvider: PublicKey;
  expectedAmount: BN;
  // Add other account properties as needed
}

export interface Escrow {
  publicKey: PublicKey;
  account: EscrowAccount;
}
