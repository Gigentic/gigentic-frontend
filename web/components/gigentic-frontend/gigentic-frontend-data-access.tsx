'use client';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';

import { useMemo } from 'react';

import { Connection, Cluster, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAnchorProvider } from '@/providers/solana-provider';
import { useCluster } from '@/cluster/cluster-data-access';

export async function getBlockhash(connection: Connection, pubkey: PublicKey) {
  // Fetch the latest blockhash and last valid block height required for transaction confirmation
  const latestBlockhash = await connection.getLatestBlockhash();
  console.log('latestBlockhash', latestBlockhash);
}

export function useGigenticProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGigenticProgramId(cluster.network as Cluster),
    [cluster],
  );
  const program = getGigenticProgram(provider);

  const accounts = useQuery({
    queryKey: ['gigentic', 'all', { cluster }],
    queryFn: () => program.account.service.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
  };
}
