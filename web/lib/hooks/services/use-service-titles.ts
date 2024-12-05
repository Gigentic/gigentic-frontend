import { useState, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';

import { EscrowAccount } from '@/types/escrow';

function extractServiceTitle(description: string): string {
  const titleMatch = description.match(/title: (.*?) \|/);
  return titleMatch ? titleMatch[1] : 'Unnamed Service';
}

export const useServiceTitles = (userEscrows: EscrowAccount[]) => {
  const { program } = useGigenticProgram();
  const { publicKey } = useWallet();
  const [serviceTitles, setServiceTitles] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  const fetchServiceTitles = useCallback(async () => {
    if (!userEscrows.length || !publicKey) return;

    try {
      console.log(
        'Starting fetchServiceTitles for',
        userEscrows.length,
        'escrows',
      );
      const startTime = performance.now();

      // 1. Fetch all services in one batch
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );
      console.log(
        'Service registry fetched with',
        serviceRegistry.serviceAccountAddresses.length,
        'services',
      );

      // 2. Batch fetch all service accounts in parallel
      // const serviceAccounts = await Promise.all(
      //   serviceRegistry.serviceAccountAddresses.map((address) =>
      //     program.account.service
      //       .fetch(address)
      //       .then((account) => ({ address, account }))
      //       .catch((err) => {
      //         console.error(
      //           `Error fetching service account ${address.toString()}:`,
      //           err,
      //         );
      //         return null;
      //       }),
      //   ),
      // ).then((results) => results.filter(Boolean));

      const serviceAccounts = await Promise.all(
        serviceRegistry.serviceAccountAddresses.map((address) =>
          program.account.service
            .fetch(address)
            .then((account) => ({ address, account })),
        ),
      );
      console.log(
        'All service accounts fetched in',
        (performance.now() - startTime).toFixed(2),
        'ms',
      );

      // 3. Create a lookup map for faster access
      // const serviceMap = new Map(
      //   serviceAccounts.map(({ address, account }) => [
      //     address.toString(),
      //     account,
      //   ]),
      // );

      // 4. Process escrows with the cached data
      // const newTitles: Record<string, string> = { ...titlesCache.current };
      // for (const escrow of uncachedEscrows) {
      //   const escrowId = escrow.publicKey.toString();
      //   const matchingService = serviceAccounts.find((serviceAccount) => {
      //     if (!serviceAccount) return false;
      //     const { address, account } = serviceAccount;
      //     try {
      //       const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
      //         [
      //           Buffer.from('escrow'),
      //           address.toBuffer(),
      //           escrow.account.serviceProvider.toBuffer(),
      //           escrow.account.customer.toBuffer(),
      //         ],
      //         program.programId,
      //       );
      //       return derivedEscrowPDA.toString() === escrowId;
      //     } catch (err) {
      //       console.error('Error deriving escrow PDA:', err);
      //       return false;
      //     }
      //   });
      //   if (matchingService?.account) {
      //     newTitles[escrowId] = extractServiceTitle(
      //       matchingService.account.description,
      //     );
      //   }
      // }

      const titles: Record<string, string> = {};
      for (const escrow of userEscrows) {
        const escrowId = escrow.publicKey.toString();
        const serviceProvider = escrow.serviceProvider;

        // Find matching service using cached data
        const matchingService = serviceAccounts.find(({ address, account }) => {
          const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('escrow'),
              address.toBuffer(),
              serviceProvider.toBuffer(),
              publicKey.toBuffer(),
            ],
            program.programId,
          );
          return derivedEscrowPDA.toString() === escrowId;
        });

        if (matchingService) {
          titles[escrowId] = extractServiceTitle(
            matchingService.account.description,
          );
          console.log('Found matching service:', {
            escrowId,
            serviceAddress: matchingService.address.toString(),
            title: titles[escrowId],
          });
        }
      }

      setServiceTitles(titles);
      console.log(
        'Total execution time:',
        (performance.now() - startTime).toFixed(2),
        'ms',
      );
    } catch (error) {
      console.error('Error fetching service titles:', error);
      setError('Failed to load escrow details');
    }
  }, [userEscrows, program, publicKey]);

  return { serviceTitles, error, fetchServiceTitles };
};
