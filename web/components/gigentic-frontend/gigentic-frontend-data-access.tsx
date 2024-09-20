'use client';

import {
  getGigenticFrontendProgram,
  getGigenticFrontendProgramId,
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

export function useGigenticFrontendProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGigenticFrontendProgramId(cluster.network as Cluster),
    [cluster]
  );
  const program = getGigenticFrontendProgram(provider);

  const accounts = useQuery({
    queryKey: ['gigentic-frontend', 'all', { cluster }],
    queryFn: () => program.account.gigenticFrontend.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const initialize = useMutation({
    mutationKey: ['gigentic-frontend', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods
        .initialize()
        .accounts({ gigenticFrontend: keypair.publicKey })
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

export function useGigenticFrontendProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useGigenticFrontendProgram();

  const accountQuery = useQuery({
    queryKey: ['gigentic-frontend', 'fetch', { cluster, account }],
    queryFn: () => program.account.gigenticFrontend.fetch(account),
  });

  const closeMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'close', { cluster, account }],
    mutationFn: () =>
      program.methods.close().accounts({ gigenticFrontend: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const decrementMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'decrement', { cluster, account }],
    mutationFn: () =>
      program.methods.decrement().accounts({ gigenticFrontend: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const incrementMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'increment', { cluster, account }],
    mutationFn: () =>
      program.methods.increment().accounts({ gigenticFrontend: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return accountQuery.refetch();
    },
  });

  const setMutation = useMutation({
    mutationKey: ['gigentic-frontend', 'set', { cluster, account }],
    mutationFn: (value: number) =>
      program.methods.set(value).accounts({ gigenticFrontend: account }).rpc(),
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
