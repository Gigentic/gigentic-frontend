import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCluster } from '@/cluster/cluster-data-access';
import { PublicKey } from '@solana/web3.js';

import { useGigenticProgram } from './use-gigentic-program';
import { extractServiceTitle } from './use-service-account';
import { useServiceRegistry } from './use-service-registry';
import { EscrowAccount } from '@/lib/types/escrow';

export interface EscrowData {
  escrows: EscrowAccount[];
  titles: Record<string, string>;
}

export function useEscrowData() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();
  const { serviceAccounts } = useServiceRegistry();

  return useQuery({
    queryKey: ['escrow-data', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey || !serviceAccounts.data) {
        return { escrows: [], titles: {} };
      }

      const allEscrows = await program.account.escrow.all();

      // Create a map of service account addresses to titles
      const serviceAccountTitles = Object.fromEntries(
        serviceAccounts.data.map((service) => [
          service.publicKey.toString(),
          extractServiceTitle(service.account.description),
        ]),
      );

      // Map escrows to their titles using the service account address
      const titles: Record<string, string> = {};
      for (const escrow of allEscrows) {
        try {
          // Find the service account that matches this escrow
          const matchingService = serviceAccounts.data.find((service) => {
            const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('escrow'),
                service.publicKey.toBuffer(),
                service.account.provider.toBuffer(),
                escrow.account.customer.toBuffer(),
              ],
              program.programId,
            );
            return derivedEscrowPDA.toString() === escrow.publicKey.toString();
          });

          if (matchingService) {
            titles[escrow.publicKey.toString()] =
              serviceAccountTitles[matchingService.publicKey.toString()];
          }
        } catch (error) {
          console.error('Error mapping escrow to title:', error);
        }
      }

      return {
        escrows: allEscrows,
        titles,
      };
    },
    enabled: !!publicKey && !!serviceAccounts.data,
    staleTime: 60 * 1000,
  });
}
