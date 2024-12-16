'use client';

import React, { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gigentic-frontend/ui-kit/ui';

import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useEscrowData } from '@/hooks/blockchain/use-escrow-data';
import { useEscrowStatus } from '@/hooks/blockchain/use-escrow-status';
import { usePayIntoEscrow } from '@/hooks/blockchain/use-pay-into-escrow';
import { useReleaseEscrow } from '@/hooks/blockchain/use-release-escrow';

import { FreelancerCard } from './freelancer-card';
import { EscrowList } from './customer-escrow-list';
import { ProviderEscrowList } from './provider-escrow-list';

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

  // Memoize customer escrows data
  const userEscrows = useMemo(() => {
    if (!escrowData?.escrows) return [];

    return escrowData.escrows.map((escrow) => ({
      id: escrow.publicKey.toString(),
      title: escrowData.titles[escrow.publicKey.toString()],
      amount: escrow.account.expectedAmount.toString(),
      provider: escrow.account.serviceProvider.toString(),
    }));
  }, [escrowData]);

  // Memoize provider escrows data
  const providerEscrows = useMemo(() => {
    if (!escrowData?.escrows || !publicKey) return [];

    return escrowData.escrows
      .filter(
        (escrow) =>
          escrow.account.serviceProvider.toString() === publicKey.toString(),
      )
      .map((escrow) => ({
        id: escrow.publicKey.toString(),
        title: escrowData.titles[escrow.publicKey.toString()],
        amount: escrow.account.expectedAmount.toString(),
        customer: escrow.account.customer.toString(),
      }));
  }, [escrowData, publicKey]);

  const { handlePayIntoEscrow, error: paymentError } = usePayIntoEscrow(
    selectedServiceAccountAddress,
  );

  const { handleReleaseEscrow, error: releaseError } = useReleaseEscrow();

  const transactionError = paymentError || releaseError;

  const isServiceInEscrow = useEscrowStatus(
    selectedServiceAccountAddress,
    publicKey,
  );

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment Hub</h1>
            <p className="text-muted-foreground text-lg">
              Manage your escrow payments and receipts
            </p>
          </div>
        </div>

        {/* Selected Provider Payment Card */}
        {freelancer && selectedServiceAccountAddress && (
          <FreelancerCard
            freelancer={freelancer}
            isServiceInEscrow={isServiceInEscrow}
            onPayIntoEscrow={handlePayIntoEscrow}
          />
        )}

        {/* Escrow Tabs */}
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer">My Payments</TabsTrigger>
            <TabsTrigger value="provider">Pending Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="mt-6">
            <EscrowList
              escrows={escrowData?.escrows || []}
              titles={escrowData?.titles || {}}
              isLoading={isLoading}
              error={escrowError?.message || transactionError || ''}
              onReleaseEscrow={handleReleaseEscrow}
            />
          </TabsContent>

          <TabsContent value="provider" className="mt-6">
            <ProviderEscrowList
              escrows={providerEscrows}
              isLoading={isLoading}
              error={escrowError?.message || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
