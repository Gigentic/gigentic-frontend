import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';

export interface EscrowAccount {
  publicKey: PublicKey;
  account: {
    customer: PublicKey;
    serviceProvider: PublicKey;
    expectedAmount: BN;
    feeAccount: PublicKey;
    feePercentage: number;
  };
}
