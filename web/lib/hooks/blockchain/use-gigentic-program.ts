/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';
import { Cluster } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnchorProvider } from '@/providers/solana-provider';
import { useCluster } from '@/cluster/cluster-data-access';

export function useGigenticProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGigenticProgramId(cluster.network as Cluster),
    [cluster],
  );
  const program = getGigenticProgram(provider);

  const serviceRegistry = useQuery({
    queryKey: ['service-registry', { cluster }],
    queryFn: async () => {
      const registry = await program.account.serviceRegistry.fetch(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );
      return registry;
    },
  });

  const accounts = useQuery({
    queryKey: ['services', { cluster }],
    queryFn: async () => {
      if (!serviceRegistry.data) return [];

      // Fetch all services from addresses in registry
      const services = await Promise.all(
        serviceRegistry.data.serviceAccountAddresses.map(async (address) => {
          const account = await program.account.service.fetch(address);
          return {
            publicKey: address,
            account,
          };
        }),
      );

      return services;
    },
    enabled: !!serviceRegistry.data,
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
