'use client';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';

import { useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

import { Program } from '@coral-xyz/anchor';
import { Connection, Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAnchorProvider } from '../solana/solana-provider';
import { useCluster } from '../cluster/cluster-data-access';

import { useTransactionToast } from '../ui/ui-layout';

export const SERVICE_REGISTRY_SPACE = 10_000_000;
export const FEE_PERCENTAGE = 0;

export async function getBlockhash(connection: Connection, pubkey: PublicKey) {
  // Fetch the latest blockhash and last valid block height required for transaction confirmation
  const latestBlockhash = await connection.getLatestBlockhash();
  console.log('latestBlockhash', latestBlockhash);
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

  const accounts = useQuery({
    queryKey: ['gigentic', 'all', { cluster }],
    queryFn: () => program.account.escrow.all(),
  });

  console.log('accounts', accounts.data);
  console.log('program', program);
  console.log('programId', programId);
  console.log('connection', connection);
  console.log('cluster', cluster);

  const getEscrowDetails = useCallback(
    async (escrowPubKey: PublicKey) => {
      if (!program) return null;
      try {
        const escrowAccount = await program.account.escrow.fetch(escrowPubKey);

        console.log('Buyer:', escrowAccount.buyer.toString());
        console.log(
          'Service Provider:',
          escrowAccount.serviceProvider.toString(),
        );
        console.log('Fee Percentage:', escrowAccount.feePercentage);
        console.log(
          'Expected Amount:',
          escrowAccount.expectedAmount.toString(),
        );
        console.log('Fee Account:', escrowAccount.feeAccount.toString());

        return escrowAccount;
      } catch (error) {
        console.error('Error fetching escrow details:', error);
        return null;
      }
    },
    [program],
  );

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    getEscrowDetails,
    // initialize,
  };
}

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
