/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { Program } from '@coral-xyz/anchor';
import { Gigentic } from '@gigentic-frontend/anchor';
import { useGigenticProgram } from './use-gigentic-program';

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

export function useServiceRegistry() {
  const { program } = useGigenticProgram();

  const serviceRegistry = useQuery({
    queryKey: ['service-registry'],
    queryFn: () => fetchServiceRegistry(program, serviceRegistryPubKey),
  });

  const serviceAccounts = useQuery({
    queryKey: ['services'],
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
