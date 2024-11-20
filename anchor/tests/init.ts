import { before } from 'mocha';

import {
  TEST_SERVICE_REGISTRY_DEPLOYER,
  MINT_AUTHORITY,
  PROVIDER,
  TEST_SERVICE_DEPLOYERS,
  TEST_FEE_ACCOUNT,
} from './constants';

import { fund_account } from './utils';
import * as anchor from '@coral-xyz/anchor';
import { createMint } from '@solana/spl-token';
import { Program, web3 } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Gigentic } from '../target/types/gigentic';

// Configure the client to use the local cluster.
anchor.setProvider(PROVIDER);

// Initialize connection to the Solana network using the provided anchor provider
export const connection: web3.Connection = PROVIDER.connection;

// Initialize the program object for the Gigentic smart contract
export const program: Program<Gigentic> = anchor.workspace
  .Gigentic as Program<Gigentic>;

// Declare a variable to hold the mint public key
export let mint: PublicKey;

/**
 * This block will run before every test in every test file.
 * It ensures that necessary accounts are funded and a new mint is created.
 */
before(async () => {
  // Fund the TEST_SERVICE_REGISTRY_DEPLOYER, MINT_AUTHORITY, and SERVICE_DEPLOYERS accounts with SOL
  const fundingPromises = [
    fund_account(connection, TEST_SERVICE_REGISTRY_DEPLOYER.publicKey),
    fund_account(connection, MINT_AUTHORITY.publicKey),
    fund_account(connection, TEST_FEE_ACCOUNT.publicKey),
    ...TEST_SERVICE_DEPLOYERS.map((deployer) =>
      fund_account(connection, deployer.publicKey),
    ),
  ];

  // Wait for all funding promises to complete in parallel
  await Promise.all(fundingPromises);

  // Create a new SPL token mint with 8 decimal places
  mint = await createMint(
    connection,
    MINT_AUTHORITY, // Fee payer for the mint creation
    MINT_AUTHORITY.publicKey, // Mint authority that can mint new tokens
    MINT_AUTHORITY.publicKey, // Freeze authority (can be set to `null` to disable freezing)
    8, // Number of decimals for the mint (similar to a currency's smallest unit)
  );
});
