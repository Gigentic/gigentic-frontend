import { useQuery } from '@tanstack/react-query';
import { PublicKey } from '@solana/web3.js';
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
      const userEscrows = allEscrows.filter(
        (escrow) => escrow.account.customer.toString() === publicKey.toString(),
      );

      const titles: Record<string, string> = {};
      for (const escrow of userEscrows) {
        const serviceAccount = await program.account.service.fetch(
          escrow.account.serviceProvider,
        );
        titles[escrow.publicKey.toString()] = extractServiceTitle(
          serviceAccount.description,
        );
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
