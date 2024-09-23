'use client';

import bs58 from 'bs58';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';

import { useMemo } from 'react';
import toast from 'react-hot-toast';

// import { Program } from '@coral-xyz/anchor';
import {
  Connection,
  LAMPORTS_PER_SOL,
  Cluster,
  Keypair,
  PublicKey,
} from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAnchorProvider } from '../solana/solana-provider';
import { useCluster } from '../cluster/cluster-data-access';

import { useTransactionToast } from '../ui/ui-layout';

// Helper function to parse keypair from environment variable
const parseKeypair = (key: string): Keypair => {
  const keypairString = process.env[key];
  if (!keypairString) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  // console.log('keypairString', keypairString);
  const keypair = Keypair.fromSecretKey(bs58.decode(keypairString));

  return keypair;
};

export const SERVICE_REGISTRY_SPACE = 10_000_000;
export const FEE_PERCENTAGE = 0;

// SEEDS
// export const SOME_SEED: string = "some-registry";

// KEYPAIRS - Setup Service Registry Accounts

// export const SERVICE_REGISTRY_DEPLOYER = Keypair.generate();
export const SERVICE_REGISTRY_DEPLOYER = parseKeypair(
  'NEXT_PUBLIC_SERVICE_REGISTRY_DEPLOYER_SECRETKEY_BS58',
);

// export const SERVICE_REGISTRY_KEYPAIR = Keypair.generate();
export const SERVICE_REGISTRY_KEYPAIR = parseKeypair(
  'NEXT_PUBLIC_SERVICE_REGISTRY_KEYPAIR_SECRETKEY_BS58',
);

export const FEE_ACCOUNT = parseKeypair(
  'NEXT_PUBLIC_FEE_ACCOUNT_SECRETKEY_BS58',
);

// export const REGISTRY_KEYPAIR = process.env.NEXT_PUBLIC_SERVICE_REGISTRY_DEPLOYER;
export const REGISTRY_KEYPAIR = Keypair.generate();

export const MINT_AUTHORITY: Keypair = Keypair.generate();

// export const MINT_AUTHORITY = parseKeypair('REACT_APP_MINT_AUTHORITY_KEYPAIR');

export const SERVICE_DEPLOYERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

export const SERVICE_USERS: Keypair[] = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate(),
];

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

export async function fundAndLogAccount(
  connection: Connection,
  account: Keypair,
  accountName: string,
) {
  try {
    await fund_account(connection, account.publicKey);
    const balance = await connection.getBalance(account.publicKey);
    console.log(
      `${accountName} (${account.publicKey.toBase58().slice(0, 8)}): ${
        balance / LAMPORTS_PER_SOL
      } SOL`,
    );
  } catch (error) {
    console.error(`Error funding ${accountName}:`, error);
  }
}

export function useGigenticProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGigenticProgramId(cluster.network as Cluster),
    [cluster],
  );
  const program = getGigenticProgram(provider);

  // const accounts = useQuery({
  //   queryKey: ['gigentic', 'all', { cluster }],
  //   queryFn: () => program.account.gigentic.all(),
  // });

  // const getProgramAccount = useQuery({
  //   queryKey: ['get-program-account', { cluster }],
  //   queryFn: () => connection.getParsedAccountInfo(programId),
  // });

  // const initialize = useMutation({
  //   mutationKey: ['gigentic', 'initialize', { cluster }],
  //   mutationFn: (keypair: Keypair) =>
  //     program.methods
  //       .initialize()
  //       .accounts({ gigentic: keypair.publicKey })
  //       .signers([keypair])
  //       .rpc(),
  //   onSuccess: (signature) => {
  //     transactionToast(signature);
  //     return accounts.refetch();
  //   },
  //   onError: () => toast.error('Failed to initialize account'),
  // });

  return {
    program,
    programId,
    // accounts,
    // getProgramAccount,
    // initialize,
  };
}

// export function useGigenticProgramAccount({ account }: { account: PublicKey }) {
//   const { cluster } = useCluster();
//   const transactionToast = useTransactionToast();
//   const { program, accounts } = useGigenticProgram();

//   const accountQuery = useQuery({
//     queryKey: ['gigentic-frontend', 'fetch', { cluster, account }],
//     queryFn: () => program.account.gigentic.fetch(account),
//   });

//   const closeMutation = useMutation({
//     mutationKey: ['gigentic-frontend', 'close', { cluster, account }],
//     mutationFn: () =>
//       program.methods.close().accounts({ gigentic: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accounts.refetch();
//     },
//   });

//   const decrementMutation = useMutation({
//     mutationKey: ['gigentic-frontend', 'decrement', { cluster, account }],
//     mutationFn: () =>
//       program.methods.decrement().accounts({ gigentic: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   const incrementMutation = useMutation({
//     mutationKey: ['gigentic-frontend', 'increment', { cluster, account }],
//     mutationFn: () =>
//       program.methods.increment().accounts({ gigentic: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   const setMutation = useMutation({
//     mutationKey: ['gigentic-frontend', 'set', { cluster, account }],
//     mutationFn: (value: number) =>
//       program.methods.set(value).accounts({ gigentic: account }).rpc(),
//     onSuccess: (tx) => {
//       transactionToast(tx);
//       return accountQuery.refetch();
//     },
//   });

//   return {
//     accountQuery,
//     closeMutation,
//     decrementMutation,
//     incrementMutation,
//     setMutation,
//   };
// }
