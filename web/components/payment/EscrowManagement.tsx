/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import {
  useSelectedFreelancer,
  useSelectFreelancer,
} from '@/hooks/services/use-freelancer-query';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { Card, CardContent, Button } from '@gigentic-frontend/ui-kit/ui';
import EscrowCard from './EscrowCard';
import { Freelancer } from '@/lib/types/freelancer';
import { serviceRegistryPubKey } from '@/lib/hooks/blockchain/use-gigentic-program';

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
  const { mutate: selectFreelancer } = useSelectFreelancer();

  // Remove unused state
  const [error, setError] = useState<string | null>(null);
  const [isServiceInEscrow, setIsServiceInEscrow] = useState(false);

  // Get service account from freelancer data if it exists
  const selectedServiceAccountAddress = useMemo(() => {
    if (!freelancer?.serviceAccountAddress) {
      console.log('No payment wallet address found');
      return null;
    }
    try {
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
    if (!publicKey || !selectedServiceAccountAddress) return;

    try {
      const serviceAccount = await program.account.service.fetch(
        selectedServiceAccountAddress,
      );
      console.log('Found service account:', {
        address: selectedServiceAccountAddress.toString(),
        provider: serviceAccount.provider.toString(),
      });

      const review_id = new Date().getTime().toString().slice(0, 10);
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      console.log('Transaction accounts:', {
        customer: publicKey.toString(),
        service: selectedServiceAccountAddress.toString(),
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
              service: selectedServiceAccountAddress,
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

      selectFreelancer(null as unknown as Freelancer, {
        onSuccess: () => {
          console.log('✅ Freelancer cache cleared successfully');
        },
        onError: (error: unknown) => {
          console.error('❌ Failed to clear freelancer cache:', error);
        },
      });
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

  useEffect(() => {
    if (!accounts.data || !selectedServiceAccountAddress || !publicKey) {
      setIsServiceInEscrow(false);
      return;
    }

    const checkServiceEscrow = async () => {
      try {
        // First get the service account to get its provider
        const serviceAccount = await program.account.service.fetch(
          selectedServiceAccountAddress,
        );

        // Now check all escrows
        console.log(
          'Checking escrows:',
          accounts.data.map((escrow) => ({
            escrowPubkey: escrow.publicKey.toString(),
            serviceProvider: escrow.account.serviceProvider.toString(),
            customer: escrow.account.customer.toString(),
          })),
        );

        // Derive the escrow PDA with the same seeds used in creation
        const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('escrow'),
            selectedServiceAccountAddress.toBuffer(),
            serviceAccount.provider.toBuffer(),
            publicKey.toBuffer(),
          ],
          program.programId,
        );

        // Check if this derived PDA exists in our escrows
        const existingEscrow = accounts.data.find(
          (escrow) =>
            escrow.publicKey.toString() === derivedEscrowPDA.toString(),
        );

        console.log('Checking escrow status:', {
          serviceAccountAddress: selectedServiceAccountAddress.toString(),
          serviceProvider: serviceAccount.provider.toString(),
          customer: publicKey.toString(),
          derivedEscrowPDA: derivedEscrowPDA.toString(),
          hasExistingEscrow: !!existingEscrow,
        });

        setIsServiceInEscrow(!!existingEscrow);
      } catch (error) {
        console.error('Error checking service escrow status:', error);
        setIsServiceInEscrow(false);
      }
    };

    checkServiceEscrow();
  }, [accounts.data, selectedServiceAccountAddress, publicKey, program]);

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
        escrowId={escrow.publicKey.toString().slice(0, 8)}
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

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Selected Provider Payment Card */}
      {freelancer && selectedServiceAccountAddress && (
        <Card className="w-full max-w-4xl mx-auto bg-background">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-semibold">
                    {freelancer.title}
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
                  Service Price to pay into escrow: {freelancer.pricePerHour}{' '}
                  SOL
                </div>
                {isServiceInEscrow ? (
                  <div className="space-y-2">
                    <p className="text-sm text-red-500">
                      This service is already in an active escrow
                    </p>
                    <Button disabled className="mt-2 opacity-50">
                      Pay into Escrow
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handlePayIntoEscrow} className="mt-2">
                    Pay into Escrow
                  </Button>
                )}
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
