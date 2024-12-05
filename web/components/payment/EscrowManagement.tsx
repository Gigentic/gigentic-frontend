'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { useEscrowAccounts } from '@/hooks/blockchain/use-escrow-accounts';
import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useServiceTitles } from '@/hooks/blockchain/use-service-titles';
import { useEscrowTransactions } from '@/hooks/blockchain/use-escrow-transactions';
import { useEscrowStatus } from '@/hooks/blockchain/use-escrow-status';

import { FreelancerCard } from './FreelancerCard';
import { EscrowList } from './EscrowList';

// const FETCH_DELAY = 500; // 500ms debounce

export default function EscrowManagement() {
  const { publicKey } = useWallet();
  const { accounts } = useEscrowAccounts();
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

  // Filter escrows for the current user
  // const userEscrows = useMemo(() => {
  //   if (!accounts.data || !publicKey) return [];
  //   return accounts.data.filter(
  //     (account) => account.account.customer.toString() === publicKey.toString(),
  //   );
  // }, [accounts.data, publicKey]);

  const userEscrows = useMemo(() => {
    if (!accounts.data || !publicKey) return [];

    console.log('Filtering escrows for user:', publicKey.toString());

    const filtered = accounts.data.filter((account) => {
      const isMatch =
        account.account.customer.toString() === publicKey.toString();
      // console.log('Checking escrow:', {
      //   escrowId: account.publicKey.toString(),
      //   customer: account.account.customer.toString(),
      //   serviceProvider: account.account.serviceProvider.toString(),
      //   isMatch,
      // });
      return isMatch;
    });

    console.log(
      'Filtered user escrows:',
      filtered.map((escrow) => ({
        publicKey: escrow.publicKey.toString(),
        serviceProvider: escrow.account.serviceProvider.toString(),
      })),
    );

    return filtered;
  }, [accounts.data, publicKey]);

  // Custom hooks
  const { serviceTitles, error: titlesError } = useServiceTitles();

  const {
    handlePayIntoEscrow,
    handleReleaseEscrow,
    error: transactionError,
  } = useEscrowTransactions(selectedServiceAccountAddress);

  const isServiceInEscrow = useEscrowStatus(
    selectedServiceAccountAddress,
    publicKey,
    accounts.data,
  );

  // Fetch service titles when escrows change with debouncing
  // useEffect(() => {
  //   if (userEscrows.length > 0) {
  //     if (fetchTimeoutRef.current) {
  //       clearTimeout(fetchTimeoutRef.current);
  //     }

  //     fetchTimeoutRef.current = setTimeout(() => {
  //       // fetchServiceTitles();
  //     }, FETCH_DELAY);
  //   }

  //   return () => {
  //     if (fetchTimeoutRef.current) {
  //       clearTimeout(fetchTimeoutRef.current);
  //     }
  //   };
  // }, [userEscrows.length, fetchServiceTitles]);

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
        serviceTitles={serviceTitles}
        isLoading={accounts.isLoading}
        error={titlesError || transactionError}
        onReleaseEscrow={handleReleaseEscrow}
      />
    </div>
  );
}
