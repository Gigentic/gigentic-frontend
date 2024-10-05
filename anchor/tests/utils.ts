import * as fs from 'fs';
import * as bs58 from 'bs58';

import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';

/**
 * Funds a given account with SOL via an airdrop.
 *
 * @param {Connection} connection - The Solana network connection.
 * @param {PublicKey} pubkey - The public key of the account to be funded.
 */
export async function fund_account(connection: Connection, pubkey: PublicKey) {
  // Request an airdrop of 1000 SOL (specified in lamports, where 1 SOL = 10^9 lamports)
  const airdropSignature = await connection.requestAirdrop(
    pubkey,
    LAMPORTS_PER_SOL * 1000,
  );

  // Fetch the latest blockhash and last valid block height required for transaction confirmation
  const latestBlockhash = await connection.getLatestBlockhash();

  // Confirm the transaction using the airdrop signature and the latest blockhash information
  await connection.confirmTransaction({
    signature: airdropSignature, // The signature of the airdrop transaction
    blockhash: latestBlockhash.blockhash, // Latest blockhash to ensure transaction validity
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight, // The height up to which the blockhash is valid
  });
}

// Load secret key from environment variable
export function loadKeypairFromEnv(envVarName: string): Keypair {
  const keypairPath = process.env[envVarName];
  if (!keypairPath) throw new Error(`${envVarName} is not set`);
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData));
}

// Load bs58-encoded keypair from environment variable
export function loadKeypairBs58FromEnv(envVarName: string): Keypair {
  const encodedKey = process.env[envVarName];
  if (!encodedKey) throw new Error(`${envVarName} is not set`);
  return Keypair.fromSecretKey(bs58.decode(encodedKey));
}
