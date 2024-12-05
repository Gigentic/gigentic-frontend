'use client';

import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useEscrowData } from '@/hooks/blockchain/use-escrow-data';
import { useEscrowTransactions } from '@/hooks/blockchain/use-escrow-transactions';
import { useEscrowStatus } from '@/hooks/blockchain/use-escrow-status';

import { FreelancerCard } from './FreelancerCard';
import { EscrowList } from './EscrowList';

export default function EscrowManagement() {
  const { data: escrowData, isLoading, error: escrowError } = useEscrowData();
  const { publicKey } = useWallet();
  const { data: freelancer } = useSelectedFreelancer();

  // Get service account from freelancer data if it exists
  const selectedServiceAccountAddress = useMemo(() => {
    if (!freelancer?.serviceAccountAddress) return null;

    try {
      return new PublicKey(freelancer.serviceAccountAddress);
    } catch (error) {
      console.error(
        'Invalid service account address:',
        freelancer.serviceAccountAddress,
      );
      return null;
    }
  }, [freelancer]);

  // Memoize transformed data
  const userEscrows = useMemo(() => {
    if (!escrowData?.escrows) return [];

    return escrowData.escrows.map((escrow) => ({
      id: escrow.publicKey.toString(),
      title: escrowData.titles[escrow.publicKey.toString()],
      amount: escrow.account.expectedAmount.toString(),
      provider: escrow.account.serviceProvider.toString(),
    }));
  }, [escrowData]);

  const {
    handlePayIntoEscrow,
    handleReleaseEscrow,
    error: transactionError,
  } = useEscrowTransactions(selectedServiceAccountAddress);

  const isServiceInEscrow = useEscrowStatus(
    selectedServiceAccountAddress,
    publicKey,
  );

  return (
    <div className="p-4 space-y-6">
      {/* Selected Provider Payment Card */}
      {freelancer && selectedServiceAccountAddress && (
        <FreelancerCard
          freelancer={freelancer}
          isServiceInEscrow={isServiceInEscrow}
          onPayIntoEscrow={handlePayIntoEscrow}
        />
      )}

      {/* Active Escrows Card */}
      <EscrowList
        escrows={userEscrows}
        isLoading={isLoading}
        error={escrowError?.message || transactionError || ''}
        onReleaseEscrow={handleReleaseEscrow}
      />
    </div>
  );
}
