import { createMint } from '@solana/spl-token';
import { createAccount } from '@solana/spl-token';
import { PublicKey, Keypair } from '@solana/web3.js';

import { Connection } from '@solana/web3.js';

export async function createMintToken(
  connection: Connection,
  deployer: Keypair,
) {
  try {
    const mint = await createMint(
      connection,
      deployer, // payer FEE
      deployer.publicKey, // owner, mint authority who can mint new tokens
      deployer.publicKey, // freeze authority
      8,
    );
    return mint;
  } catch (error) {
    console.error('Error creating mint token:', error);
  }
}

export async function createTokenAccount(
  connection: Connection,
  payerKeypair: Keypair,
  mint: PublicKey,
): Promise<PublicKey> {
  try {
    const tokenAccount: PublicKey = await createAccount(
      connection,
      payerKeypair, // Payer
      mint, // Mint
      payerKeypair.publicKey, // Owner
    );
    return tokenAccount;
  } catch (error) {
    console.error('Error creating token account:', error);
    throw new Error('Failed to create token account');
  }
}
