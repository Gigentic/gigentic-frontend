import { before } from 'mocha';

import {
  TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR,
  MINT_AUTHORITY_KEYPAIR,
  PROVIDER,
  TEST_SERVICE_DEPLOYERS,
  TEST_FEE_ACCOUNT,
  TEST_SERVICE_USERS,
} from './constants';

import { fund_account } from './utils';
import * as anchor from '@coral-xyz/anchor';
import { createMint, mintTo, createAccount } from '@solana/spl-token';
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
export let feeTokenAccount: PublicKey;
export let serviceProviderTokenAccount: PublicKey;
export let customerTokenAccount: PublicKey;
/**
 * This block will run before every test in every test file.
 * It ensures that necessary accounts are funded and a new mint is created.
 */
before(async () => {
  // Fund the TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR, MINT_AUTHORITY, and SERVICE_DEPLOYERS accounts with SOL
  const fundingPromises = [
    fund_account(connection, TEST_SERVICE_REGISTRY_DEPLOYER_KEYPAIR.publicKey),
    fund_account(connection, MINT_AUTHORITY_KEYPAIR.publicKey),
    fund_account(connection, TEST_FEE_ACCOUNT.publicKey),
    ...TEST_SERVICE_DEPLOYERS.map((deployer) =>
      fund_account(connection, deployer.publicKey),
    ),
    ...TEST_SERVICE_USERS.map((user) =>
      fund_account(connection, user.publicKey),
    ),
  ];

  // Wait for all funding promises to complete in parallel
  await Promise.all(fundingPromises);

  try {
    // Create a new SPL token mint with 8 decimal places
    mint = await createMint(
      connection,
      MINT_AUTHORITY_KEYPAIR, // Fee payer for the mint creation
      MINT_AUTHORITY_KEYPAIR.publicKey, // Mint authority that can mint new tokens
      MINT_AUTHORITY_KEYPAIR.publicKey, // Freeze authority (can be set to `null` to disable freezing)
      8, // Number of decimals for the mint (similar to a currency's smallest unit)
    );
    feeTokenAccount = await createAccount(
      connection,
      TEST_FEE_ACCOUNT, // Payer
      mint, // Mint
      TEST_FEE_ACCOUNT.publicKey, // Owner
    );

    serviceProviderTokenAccount = await createAccount(
      connection,
      TEST_SERVICE_DEPLOYERS[0], // Payer
      mint, // Mint
      TEST_SERVICE_DEPLOYERS[0].publicKey, // Owner
    );
    customerTokenAccount = await createAccount(
      connection,
      TEST_SERVICE_USERS[1], // Payer
      mint, // Mint
      TEST_SERVICE_USERS[1].publicKey, // Owner
    );

    // Mint tokens to the customer's token account
    await mintTo(
      connection,
      MINT_AUTHORITY_KEYPAIR, // Payer
      mint, // Mint
      customerTokenAccount, // Destination
      MINT_AUTHORITY_KEYPAIR, // Authority
      1000000000, // Amount
    );
  } catch (err) {
    console.error('Error during token minting and account creation:', err);
  }
});
