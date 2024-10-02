import * as fs from 'fs';

import { Program } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import {
  clusterApiUrl,
  Keypair,
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from '@solana/web3.js';

import { Gigentic } from '../target/types/gigentic';

import {
  SERVICE_DEPLOYERS,
  SERVICE_REGISTRY_KEYPAIR,
} from '../tests/constants';

// Initialize the program
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

export const program: Program<Gigentic> = anchor.workspace
  .Gigentic as Program<Gigentic>;

// Load the admin keypair which is used to deploy the program and create the service registry
const keypairPath = '/Users/marci/.config/solana/id.json';

const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

console.log('keypairPath', keypairPath);
console.log('keypairData', keypairData.toString());
console.log('payer', payer.publicKey.toString());
