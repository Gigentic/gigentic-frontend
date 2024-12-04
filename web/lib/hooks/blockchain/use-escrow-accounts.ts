import { useQuery } from '@tanstack/react-query';
import { useCluster } from '@/cluster/cluster-data-access';
import { useGigenticProgram } from './use-gigentic-program';

export function useEscrowAccounts() {
  const { cluster } = useCluster();
  const { program } = useGigenticProgram();

  // Query for all escrow accounts
  const accounts = useQuery({
    queryKey: ['escrow', 'all', { cluster }],
    queryFn: async () => {
      const allEscrows = await program.account.escrow.all();
      console.log(
        'All fetched escrows:',
        allEscrows.map((escrow) => ({
          publicKey: escrow.publicKey.toString(),
          serviceProvider: escrow.account.serviceProvider.toString(),
          customer: escrow.account.customer.toString(),
          amount: escrow.account.expectedAmount.toString(),
        })),
      );
      return allEscrows;
    },
    staleTime: 60 * 1000,
  });

  return { program, accounts };
}
