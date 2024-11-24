/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import { useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useQuery } from '@tanstack/react-query';
import { useCluster } from '@/cluster/cluster-data-access';
import { useAnchorProvider } from '@/providers/solana-provider';
import { getGigenticProgram } from '@gigentic-frontend/anchor';
import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { Card, CardContent, Button } from '@gigentic-frontend/ui-kit/ui';
import EscrowCard from './EscrowCard';

function useEscrowAccounts() {
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const program = getGigenticProgram(provider);

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

export default function EscrowManagement() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const { accounts, program } = useEscrowAccounts();
  const { data: freelancer } = useSelectedFreelancer();

  // Remove unused state
  const [error, setError] = useState<string | null>(null);

  // Get service account from freelancer data if it exists
  const serviceAccountPubKey = useMemo(() => {
    if (!freelancer?.paymentWalletAddress) {
      console.log('No payment wallet address found');
      return null;
    }
    try {
      const pubkey = new PublicKey(freelancer.paymentWalletAddress);
      console.log('Created service account pubkey:', pubkey.toString());
      return pubkey;
    } catch (error) {
      console.error(
        'Invalid service account address:',
        freelancer.paymentWalletAddress,
      );
      return null;
    }
  }, [freelancer]);

  // Filter escrows for the current user
  const userEscrows = useMemo(() => {
    if (!accounts.data || !publicKey) return [];

    console.log('Filtering escrows for user:', publicKey.toString());

    const filtered = accounts.data.filter((account) => {
      const isMatch =
        account.account.customer.toString() === publicKey.toString();
      console.log('Checking escrow:', {
        escrowId: account.publicKey.toString(),
        customer: account.account.customer.toString(),
        serviceProvider: account.account.serviceProvider.toString(),
        isMatch,
      });
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

  const handlePayIntoEscrow = async () => {
    if (!publicKey || !serviceAccountPubKey) return;

    try {
      const serviceRegistryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );

      const serviceAccount =
        await program.account.service.fetch(serviceAccountPubKey);
      console.log('Found service account:', {
        address: serviceAccountPubKey.toString(),
        provider: serviceAccount.provider.toString(),
      });

      const review_id = new Date().getTime().toString().slice(0, 10);
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      console.log('Transaction accounts:', {
        customer: publicKey.toString(),
        service: serviceAccountPubKey.toString(),
        serviceRegistry: serviceRegistryPubKey.toString(),
      });

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          await program.methods
            .payService(review_id)
            .accounts({
              customer: publicKey,
              service: serviceAccountPubKey,
              serviceRegistry: serviceRegistryPubKey,
            })
            .instruction(),
        ],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const signature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed',
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signature);
      accounts.refetch();
    } catch (error) {
      console.error('Error sending transaction:', error);
      setError('Failed to process payment. Please try again.');
    }
  };

  // Modify handleReleaseEscrow to use the index
  const handleReleaseEscrow = async (
    escrowId: string,
    serviceProvider: PublicKey,
  ) => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      console.log('Releasing escrow:', {
        escrowId,
        serviceProvider: serviceProvider.toString(),
      });

      // Pass both serviceProvider and escrowId
      const serviceIndex = await findServiceAccountIndex(
        serviceProvider,
        escrowId,
      );
      console.log('Found matching service index:', serviceIndex);

      const serviceRegistryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );

      // Find the escrow account in our list
      const escrow = accounts.data?.find(
        (e) => e.publicKey.toString() === escrowId,
      );

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      // Use the actual escrow public key instead of deriving a new one
      const escrowPubKey = escrow.publicKey;
      console.log('Using escrow:', escrowPubKey.toString());

      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      // Find the correct service account for this escrow
      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[serviceIndex];

      console.log('Release transaction accounts:', {
        escrow: escrowPubKey.toString(),
        service: serviceAccountPubKey.toString(),
        serviceProvider: serviceProvider.toString(),
        signer: publicKey.toString(),
      });

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          await program.methods
            .signService()
            .accounts({
              signer: publicKey,
              service: serviceAccountPubKey,
              serviceProvider: serviceProvider,
              feeAccount: serviceRegistry.feeAccount,
            })
            .instruction(),
        ],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const signature = await sendTransaction(transaction, connection);

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        'confirmed',
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signature);
      accounts.refetch();
    } catch (error) {
      console.error('Error releasing escrow:', error);
      setError('Failed to release escrow. Please try again.');
    }
  };

  // Move findServiceAccountIndex inside the component
  const findServiceAccountIndex = async (
    serviceProvider: PublicKey,
    escrowId: string,
  ) => {
    const serviceRegistryPubKey = new PublicKey(
      process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
    );

    // First find the escrow
    const escrow = accounts.data?.find(
      (e) => e.publicKey.toString() === escrowId,
    );

    if (!escrow) {
      throw new Error('Escrow not found');
    }

    console.log('Found escrow:', {
      escrowId: escrow.publicKey.toString(),
      serviceProvider: escrow.account.serviceProvider.toString(),
      expectedAmount: escrow.account.expectedAmount.toString(),
    });

    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryPubKey,
    );

    // Find the service account that matches the provider
    for (let i = 0; i < serviceRegistry.serviceAccountAddresses.length; i++) {
      const serviceAddress = serviceRegistry.serviceAccountAddresses[i];
      const serviceAccount =
        await program.account.service.fetch(serviceAddress);

      console.log('Checking service:', {
        index: i,
        address: serviceAddress.toString(),
        provider: serviceAccount.provider.toString(),
        escrowProvider: escrow.account.serviceProvider.toString(),
      });

      // Match by service provider
      if (
        serviceAccount.provider.toString() ===
        escrow.account.serviceProvider.toString()
      ) {
        // Derive the escrow PDA to verify it matches
        const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('escrow'),
            serviceAddress.toBuffer(),
            serviceAccount.provider.toBuffer(),
            escrow.account.customer.toBuffer(),
          ],
          program.programId,
        );

        if (derivedEscrowPDA.toString() === escrowId) {
          console.log(`Found exact service match at index ${i}`);
          return i;
        }
      }
    }

    throw new Error('No matching service account found');
  };

  const renderEscrowContent = () => {
    if (accounts.isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500 py-4">{error}</div>;
    }

    if (userEscrows.length === 0) {
      return (
        <div className="text-center text-muted-foreground">
          No active escrows found
        </div>
      );
    }

    return userEscrows.map((escrow) => (
      <EscrowCard
        key={escrow.publicKey.toString()}
        providerName={`Provider ${escrow.account.serviceProvider.toString().slice(0, 8)}...`}
        serviceId={escrow.publicKey.toString().slice(0, 8)}
        amountInEscrow={
          Number(escrow.account.expectedAmount) / LAMPORTS_PER_SOL
        }
        onReleaseEscrow={() =>
          handleReleaseEscrow(
            escrow.publicKey.toString(),
            escrow.account.serviceProvider,
          )
        }
      />
    ));
  };

  // Add this check in the userEscrows useMemo
  const hasActiveEscrow = useMemo(() => {
    if (!accounts.data || !publicKey || !serviceAccountPubKey) return false;

    return accounts.data.some(
      (account) =>
        account.account.customer.toString() === publicKey.toString() &&
        account.account.serviceProvider.toString() ===
          serviceAccountPubKey.toString(),
    );
  }, [accounts.data, publicKey, serviceAccountPubKey]);

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Selected Provider Payment Card */}
      {freelancer && serviceAccountPubKey && !hasActiveEscrow && (
        <Card className="w-full max-w-4xl mx-auto bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {freelancer.title}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Service ID: {freelancer.paymentWalletAddress.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⭐ {freelancer.rating}</span>
                  <span className="text-green-500">
                    {freelancer.matchScore}% match
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  Service Price to pay into Escrow: {freelancer.pricePerHour}{' '}
                  SOL
                </div>
                <Button onClick={handlePayIntoEscrow} className="mt-2">
                  Pay into Escrow
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Escrows Card */}
      <Card className="w-full max-w-4xl mx-auto bg-background">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Active Escrows</h2>
          <div className="space-y-4">{renderEscrowContent()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
