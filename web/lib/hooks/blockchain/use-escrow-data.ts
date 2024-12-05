import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { EscrowAccount } from '@/lib/types/escrow';
import { useServiceRegistry } from './use-service-registry';
import { PublicKey } from '@solana/web3.js';

export interface EscrowData {
  escrows: EscrowAccount[];
  titles: Record<string, string>;
}

function extractServiceTitle(description: string): string {
  const titleMatch = description.match(/title:\s*(.*?)(?:\||$)/);
  return titleMatch ? titleMatch[1].trim() : 'Title not found';
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
      const userEscrows = allEscrows.filter(
        (escrow) => escrow.account.customer.toString() === publicKey.toString(),
      );

      // Create a map of service account addresses to titles
      const serviceAccountTitles = Object.fromEntries(
        serviceAccounts.data.map((service) => [
          service.publicKey.toString(),
          extractServiceTitle(service.account.description),
        ]),
      );

      // Map escrows to their titles using the service account address
      const titles: Record<string, string> = {};
      for (const escrow of userEscrows) {
        try {
          // Find the service account that matches this escrow's PDA
          const matchingService = serviceAccounts.data.find((service) => {
            const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('escrow'),
                service.publicKey.toBuffer(),
                service.account.provider.toBuffer(),
                publicKey.toBuffer(),
              ],
              program.programId,
            );
            return derivedEscrowPDA.toString() === escrow.publicKey.toString();
          });

          titles[escrow.publicKey.toString()] = matchingService
            ? serviceAccountTitles[matchingService.publicKey.toString()]
            : 'Unnamed Service';
        } catch (error) {
          console.error('Error mapping escrow to title:', error);
        }
      }

      return {
        escrows: userEscrows,
        titles,
      };
    },
    enabled: !!publicKey && !!serviceAccounts.data,
    staleTime: 60 * 1000,
  });
}
