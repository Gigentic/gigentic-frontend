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
  const { data, isLoading, error } = useEscrowData();
  const { publicKey } = useWallet();
  const { data: freelancer } = useSelectedFreelancer();

  // Get service account from freelancer data if it exists
  const selectedServiceAccountAddress = useMemo(() => {
    // if (!freelancer?.serviceAccountAddress) return null;
    if (!freelancer?.serviceAccountAddress) {
      console.log('No payment wallet address found');
      return null;
    }
    try {
      // return new PublicKey(freelancer.serviceAccountAddress);
      const pubkey = new PublicKey(freelancer.serviceAccountAddress);
      console.log('Created service account pubkey:', pubkey.toString());
      return pubkey;
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
    if (!data?.escrows) return [];

    return data.escrows.map((escrow) => ({
      id: escrow.publicKey.toString(),
      title: data.titles[escrow.publicKey.toString()] || 'Unnamed Service',
      amount: escrow.account.expectedAmount.toString(),
      provider: escrow.account.serviceProvider.toString(),
    }));
  }, [data]);

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
        error={error?.message || ''}
        onReleaseEscrow={handleReleaseEscrow}
      />
    </div>
  );
}
