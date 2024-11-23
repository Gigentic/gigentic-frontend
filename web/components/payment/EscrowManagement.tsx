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
import { InfoIcon } from 'lucide-react';
import { useCluster } from '@/cluster/cluster-data-access';
import { useAnchorProvider } from '@/providers/solana-provider';
import { getGigenticProgram } from '@gigentic-frontend/anchor';
import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';
import { useTransactionToast } from '@/components/ui/ui-layout';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Checkbox,
} from '@gigentic-frontend/ui-kit/ui';
import EscrowCard from './EscrowCard';

function useEscrowAccounts() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const provider = useAnchorProvider();
  const program = getGigenticProgram(provider);

  // Query for all escrow accounts
  const accounts = useQuery({
    queryKey: ['escrow', 'all', { cluster }],
    queryFn: () => program.account.escrow.all(),
    staleTime: 60 * 1000, // Cache for 1 minute
  });

  return {
    program,
    accounts,
  };
}

export default function EscrowManagement() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const { accounts, program } = useEscrowAccounts();
  const { data: freelancer } = useSelectedFreelancer();

  // Remove unused state
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get service account from freelancer data if it exists
  const serviceAccountPubKey = useMemo(() => {
    if (!freelancer?.paymentWalletAddress) {
      return null;
    }
    try {
      return new PublicKey(freelancer.paymentWalletAddress);
    } catch (error) {
      console.error('Invalid service account address');
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

  const handlePayIntoEscrow = async () => {
    if (!publicKey || !serviceAccountPubKey) {
      console.error('Wallet not connected or no service selected');
      return;
    }

    try {
      const serviceRegistryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );

      console.log('Service Account:', serviceAccountPubKey.toString());

      const review_id = new Date().getTime().toString().slice(0, 10);
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      console.log('Latest Blockhash:', latestBlockhash.blockhash);
      console.log(review_id);
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
      console.log('Transaction:', transaction);
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

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const serviceRegistryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );

      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];
      const serviceAccount =
        await program.account.service.fetch(serviceAccountPubKey);

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
              serviceProvider: serviceAccount.provider,
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
        onReleaseEscrow={() => handleReleaseEscrow(escrow.publicKey.toString())}
      />
    ));
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Selected Provider Payment Card - Only show when freelancer is selected */}
      {freelancer && serviceAccountPubKey && (
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

      {/* Active Escrows Card - Always show */}
      <Card className="w-full max-w-4xl mx-auto bg-background">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">Active Escrows</h2>
          <div className="space-y-4">{renderEscrowContent()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
