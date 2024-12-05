import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGigenticProgram } from './use-gigentic-program';
import { useCluster } from '@/cluster/cluster-data-access';
import { EscrowAccount } from '@/lib/types/escrow';

export interface EscrowData {
  escrows: EscrowAccount[];
  titles: Record<string, string>;
}

function extractServiceTitle(description: string): string {
  const titleMatch = description.match(/title: (.*?) \|/);
  return titleMatch ? titleMatch[1] : 'Unnamed Service';
}

export function useEscrowData() {
  const { publicKey } = useWallet();
  const { program } = useGigenticProgram();
  const { cluster } = useCluster();

  return useQuery({
    queryKey: ['escrow-data', { cluster, publicKey: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) {
        return { escrows: [], titles: {} };
      }

      const allEscrows = await program.account.escrow.all();
      console.log('Fetched all escrows:', allEscrows);

      const userEscrows = allEscrows.filter(
        (escrow) => escrow.account.customer.toString() === publicKey.toString(),
      );
      console.log('Filtered user escrows:', userEscrows);

      const titles: Record<string, string> = {};
      for (const escrow of userEscrows) {
        try {
          const serviceAccount = await program.account.service.fetch(
            escrow.account.serviceProvider,
          );
          console.log(
            `Fetched service account for escrow ${escrow.publicKey.toString()}:`,
            serviceAccount,
          );
          titles[escrow.publicKey.toString()] = extractServiceTitle(
            serviceAccount.description,
          );
        } catch (fetchError) {
          console.error(
            `Error fetching service account for escrow ${escrow.publicKey.toString()}:`,
            fetchError,
          );
          titles[escrow.publicKey.toString()] = 'Unnamed Service';
        }
      }

      return {
        escrows: userEscrows,
        titles,
      };
    },
    staleTime: 60 * 1000,
    enabled: !!publicKey,
  });
}
