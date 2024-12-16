// Currently not used, leaving here for future reference
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
      console.log('Starting service lookup...');

      const [serviceRegistry, allEscrows] = await Promise.all([
        program.account.serviceRegistry.fetch(serviceRegistryPubKey),
        program.account.escrow.all(),
      ]);

      console.log('Found escrows:', allEscrows.length);
      console.log(
        'Service registry addresses:',
        serviceRegistry.serviceAccountAddresses.length,
      );

      // First create a map of provider addresses to service accounts with their indices
      const serviceAccountsByProvider = new Map();

      for (let i = 0; i < serviceRegistry.serviceAccountAddresses.length; i++) {
        const address = serviceRegistry.serviceAccountAddresses[i];
        const account = await program.account.service.fetch(address);
        const providerKey = account.provider.toString();

        if (!serviceAccountsByProvider.has(providerKey)) {
          serviceAccountsByProvider.set(providerKey, []);
        }
        serviceAccountsByProvider.get(providerKey).push({
          address,
          account,
          index: i, // Store the index from the registry
        });
      }

      const lookupMap: ServiceLookupMap = {};

      // Process each escrow
      for (const escrow of allEscrows) {
        const escrowId = escrow.publicKey.toString();
        const providerKey = escrow.account.serviceProvider.toString();

        console.log('\nProcessing escrow:', {
          escrowId,
          provider: providerKey,
        });

        // Get all services for this provider
        const matchingServices =
          serviceAccountsByProvider.get(providerKey) || [];

        // Find the exact service by verifying PDA
        for (const { address, account, index } of matchingServices) {
          const [derivedPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('escrow'),
              address.toBuffer(),
              account.provider.toBuffer(),
              escrow.account.customer.toBuffer(),
            ],
            program.programId,
          );

          console.log('Checking service match:', {
            serviceAddress: address.toString(),
            derivedPDA: derivedPDA.toString(),
            actualEscrow: escrowId,
            serviceIndex: index,
            matches: derivedPDA.toString() === escrowId,
          });

          if (derivedPDA.toString() === escrowId) {
            lookupMap[escrowId] = {
              serviceAccountPubkey: address,
              serviceIndex: index, // Use the stored index directly
            };
            console.log('Added to lookup map:', {
              escrowId,
              serviceIndex: index,
              serviceAddress: address.toString(),
            });
            break; // Stop after finding exact match
          }
        }
      }

      console.log(
        '\nFinal lookup map:',
        Object.entries(lookupMap).map(([escrowId, info]) => ({
          escrowId,
          serviceIndex: info.serviceIndex,
          serviceAddress: info.serviceAccountPubkey.toString(),
        })),
      );
      return lookupMap;
    },
    refetchOnMount: true,
    retry: 2,
    retryDelay: 1000,
  });
}
