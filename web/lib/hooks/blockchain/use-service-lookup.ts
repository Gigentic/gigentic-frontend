import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
import { useGigenticProgram } from './use-gigentic-program';
import { serviceRegistryPubKey } from './use-service-registry';

interface ServiceLookupMap {
  [escrowId: string]: {
    serviceIndex: number;
    serviceAccountPubkey: PublicKey;
  };
}

export function useServiceLookup() {
  const { program } = useGigenticProgram();

  return useQuery({
    queryKey: ['service-lookup-map'],
    queryFn: async (): Promise<ServiceLookupMap> => {
      // Fetch all required data in parallel
      const [serviceRegistry, allEscrows] = await Promise.all([
        program.account.serviceRegistry.fetch(serviceRegistryPubKey),
        program.account.escrow.all(),
      ]);

      // Fetch all service accounts in parallel
      const serviceAccounts = await Promise.all(
        serviceRegistry.serviceAccountAddresses.map((address, index) =>
          program.account.service
            .fetch(address)
            .then((account) => ({ address, index, account })),
        ),
      );

      // Build lookup map
      const lookupMap: ServiceLookupMap = {};

      // Create lookup entries for each escrow
      allEscrows.forEach((escrow) => {
        const matchingService = serviceAccounts.find(
          ({ account }) =>
            account.provider.toString() ===
            escrow.account.serviceProvider.toString(),
        );

        if (matchingService) {
          const [derivedPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('escrow'),
              matchingService.address.toBuffer(),
              matchingService.account.provider.toBuffer(),
              escrow.account.customer.toBuffer(),
            ],
            program.programId,
          );

          if (derivedPDA.toString() === escrow.publicKey.toString()) {
            lookupMap[escrow.publicKey.toString()] = {
              serviceIndex: matchingService.index,
              serviceAccountPubkey: matchingService.address,
            };
          }
        }
      });

      return lookupMap;
    },
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}
