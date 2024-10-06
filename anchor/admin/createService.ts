import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Gigentic } from '../target/types/gigentic';
// import { SERVICE_REGISTRY_KEYPAIR } from '../tests/constants';
import * as anchor from '@coral-xyz/anchor';

export function loadKeypairBs58FromEnv(envVarName: string): Keypair {
  const encodedKey = process.env[envVarName];
  if (!encodedKey) throw new Error(`${envVarName} is not set`);
  return Keypair.fromSecretKey(bs58.decode(encodedKey));
}

dotenv.config();

const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');

export async function createService(
  serviceRegistryPubkey: PublicKey,
  _mint: PublicKey,
  program: Program<Gigentic>,
  price: number,
  serviceDescription: string,
  uniqueId: string,
) {
  await program.methods
    .initializeService(
      uniqueId as string,
      serviceDescription,
      new anchor.BN(price),
    )
    .accounts({
      provider: serviceDeployer.publicKey,
      serviceRegistry: serviceRegistryPubkey,
      mint: _mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([serviceDeployer]) // Include both deployer and the new service keypair as signers
    .rpc();

  const serviceRegistry = await program.account.serviceRegistry.fetch(
    serviceRegistryPubkey,
  );

  for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
    const serviceAccount = await program.account.service.fetch(serviceAddress);
    // console.log('Service Account:', serviceAccount);
    console.log('Service Account Address:', serviceAddress.toString());
    // console.log('Service Account Unique ID:', serviceAccount.uniqueId);
    console.log('Service Account Description:', serviceAccount.description);
    console.log('Service Account Price:', serviceAccount.price.toString());
    // console.log('Service Account Mint:', serviceAccount.mint.toString());
  }
}
