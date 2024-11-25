import * as dotenv from 'dotenv';

import { Program, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { Gigentic } from '../target/types/gigentic';
import { loadKeypairBs58FromEnv } from '../tests/utils';

dotenv.config();

const serviceDeployer = loadKeypairBs58FromEnv('SERVICE_DEPLOYER_KEYPAIR');

export async function createService(
  serviceRegistryPubkey: PublicKey,
  _mint: PublicKey,
  program: Program<Gigentic>,
  price: number,
  serviceDescription: string,
  uniqueId: string,
) {
  await program.methods
    .initializeService(uniqueId as string, serviceDescription, new BN(price))
    .accounts({
      provider: serviceDeployer.publicKey,
      serviceRegistry: serviceRegistryPubkey,
      mint: _mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .signers([serviceDeployer]) // Include both deployer and the new service keypair as signers
    .rpc();
}
