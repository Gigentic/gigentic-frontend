import { useMemo } from 'react';
import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';
import { useAnchorProvider } from '@/providers/solana-provider';
import { useCluster } from '@/cluster/cluster-data-access';
import { Cluster } from '@solana/web3.js';

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
