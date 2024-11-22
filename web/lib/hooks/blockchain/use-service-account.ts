'use client';

import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useGigenticProgram } from './use-gigentic-program';

export function useServiceAccount(account: PublicKey) {
  const { program } = useGigenticProgram();

  return useQuery({
    queryKey: ['service', account.toString()],
    queryFn: () => program.account.service.fetch(account),
  });
}
