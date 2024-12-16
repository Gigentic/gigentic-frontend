'use client';

import { PublicKey } from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useGigenticProgram } from './use-gigentic-program';

export function extractServiceTitle(description: string): string {
  const titleMatch = description.match(/title:\s*(.*?)(?:\||$)/);
  return titleMatch ? titleMatch[1].trim() : 'Title not found';
}

export function useServiceAccount(account: PublicKey) {
  const { program } = useGigenticProgram();

  return useQuery({
    queryKey: ['service', account.toString()],
    queryFn: () => program.account.service.fetch(account),
  });
}
