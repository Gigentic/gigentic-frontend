'use client';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { Cluster, Keypair, PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';

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
    queryFn: () => program.account.gigentic.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['gigentic', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ gigentic: keypair.publicKey })
        .signers([keypair])
        .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error('Failed to initialize account'),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  };
}

export function useGigenticProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useGigenticProgram();

  const accountQuery = useQuery({
    queryKey: ['gigentic-frontend', 'fetch', { cluster, account }],
    queryFn: () => program.account.gigentic.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ gigentic: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ gigentic: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ gigentic: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ gigentic: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  };
}
