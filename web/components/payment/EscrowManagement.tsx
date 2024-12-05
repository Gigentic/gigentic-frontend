'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { useEscrowAccounts } from '@/lib/hooks/blockchain/use-escrow-accounts';
import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useServiceTitles } from '@/lib/hooks/services/use-service-titles';
import { useTransactionHandlers } from '@/lib/hooks/blockchain/use-transaction-handlers';
import { useEscrowStatus } from '@/lib/hooks/blockchain/use-escrow-status';

import { FreelancerCard } from './FreelancerCard';
import { EscrowList } from './EscrowList';
import { Escrow } from '@/lib/types/escrow';

const FETCH_DELAY = 500; // 500ms debounce

export default function EscrowManagement() {
  const { publicKey } = useWallet();
  const { accounts } = useEscrowAccounts();
  const { data: freelancer } = useSelectedFreelancer();
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();

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

  // Filter escrows for the current user
  const userEscrows = useMemo(() => {
    if (!accounts.data || !publicKey) return [];
    return accounts.data.filter(
      (account) => account.account.customer.toString() === publicKey.toString(),
    );
  }, [accounts.data, publicKey]);

  // Custom hooks
  const {
    serviceTitles,
    error: titlesError,
    fetchServiceTitles,
  } = useServiceTitles(userEscrows as unknown as Escrow[]);

  const {
    handlePayIntoEscrow,
    handleReleaseEscrow,
    error: transactionError,
  } = useTransactionHandlers(selectedServiceAccountAddress);

  const isServiceInEscrow = useEscrowStatus(
    selectedServiceAccountAddress,
    publicKey,
  );

  // Fetch service titles when escrows change with debouncing
  useEffect(() => {
    if (userEscrows.length > 0) {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }

      fetchTimeoutRef.current = setTimeout(() => {
        fetchServiceTitles();
      }, FETCH_DELAY);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [userEscrows.length, fetchServiceTitles]);

  return (
    <div className="p-4 space-y-6">
      {freelancer && selectedServiceAccountAddress && (
        <FreelancerCard
          freelancer={freelancer}
          isServiceInEscrow={isServiceInEscrow}
          onPayIntoEscrow={handlePayIntoEscrow}
        />
      )}

      <EscrowList
        escrows={userEscrows as unknown as Escrow[]}
        serviceTitles={serviceTitles}
        isLoading={accounts.isLoading}
        error={titlesError || transactionError}
        onReleaseEscrow={handleReleaseEscrow}
      />
    </div>
  );
}
