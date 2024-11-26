/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import {
  getGigenticProgram,
  getGigenticProgramId,
  Gigentic,
} from '@gigentic-frontend/anchor';
import { Cluster, PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAnchorProvider } from '@/providers/solana-provider';
import { useCluster } from '@/cluster/cluster-data-access';
import { Program } from '@coral-xyz/anchor';

// Direct access to environment variable
export const serviceRegistryPubKey = new PublicKey(
  process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
);

export const mintPubKey = new PublicKey(process.env.NEXT_PUBLIC_MINT_PUBKEY!);

export async function fetchServiceRegistry(
  program: Program<Gigentic>,
  serviceRegistryPubKey: PublicKey,
) {
  return program.account.serviceRegistry.fetch(serviceRegistryPubKey);
}

export function useGigenticProgram() {
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getGigenticProgramId(cluster.network as Cluster),
    [cluster],
  );
  const program = getGigenticProgram(provider);

  return {
    program,
    programId,
  };
}

export function useServiceRegistry() {
  const { cluster } = useCluster();
  const { program } = useGigenticProgram();

  const serviceRegistry = useQuery({
    queryKey: ['service-registry', { cluster }],
    queryFn: () => fetchServiceRegistry(program, serviceRegistryPubKey),
  });

  const serviceAccounts = useQuery({
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

  return {
    serviceAccounts,
  };
}
