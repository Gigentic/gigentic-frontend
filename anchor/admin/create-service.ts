import * as bs58 from 'bs58';
import * as dotenv from 'dotenv';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from 'bn.js';
import { Gigentic } from '../target/types/gigentic';
import { SERVICE_REGISTRY_KEYPAIR } from '../tests/constants';

export function loadKeypairBs58FromEnv(envVarName: string): Keypair {
  const encodedKey = process.env[envVarName];
  if (!encodedKey) throw new Error(`${envVarName} is not set`);
  return Keypair.fromSecretKey(bs58.decode(encodedKey));
}

dotenv.config();

const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER');

const mint: PublicKey = new PublicKey(
  'GZcrawRVdh9mY7aAm7Lt4FbqTNVwYTeVEcFd2SnNCfX6',
);

export async function createService(
  program: Program<Gigentic>,
  price,
  serviceDescription,
) {
  await program.methods
    .initializeService(serviceDescription, new BN(price))
    .accounts({
      provider: serviceDeployer.publicKey,
      serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey,
      mint: mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([serviceDeployer])
    .rpc();

  const serviceRegistry = await program.account.serviceRegistry.fetch(
    SERVICE_REGISTRY_KEYPAIR.publicKey,
  );

  for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
    const serviceAccount = await program.account.service.fetch(serviceAddress);
    console.log('Service Account:', serviceAccount);
    console.log('Service Account Address:', serviceAddress.toString());
    console.log('Service Account Description:', serviceAccount.description);
    console.log('Service Account Price:', serviceAccount.price.toString());
    console.log('Service Account Mint:', serviceAccount.mint.toString());
  }
}
