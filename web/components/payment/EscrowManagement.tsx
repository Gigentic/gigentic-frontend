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

  // Form and service state
  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get cached freelancer data
  const { data: freelancer } = useSelectedFreelancer();

  const DEFAULT_SERVICE_ACCOUNT = '11111111111111111111111111111111'; // Solana's system program address

  const serviceAccountPubKey = useMemo(() => {
    console.log(
      'Freelancer payment wallet address:',
      freelancer?.paymentWalletAddress,
    );

    // Use default address if none is provided
    const address = freelancer?.paymentWalletAddress || DEFAULT_SERVICE_ACCOUNT;

    try {
      return new PublicKey(address);
    } catch (error) {
      console.warn(
        'Invalid service account address, using default:',
        DEFAULT_SERVICE_ACCOUNT,
      );
      return new PublicKey(DEFAULT_SERVICE_ACCOUNT);
    }
  }, [freelancer]);

  // Filter escrows for the current user
  const userEscrows = useMemo(() => {
    if (!accounts.data || !publicKey) return [];
    return accounts.data.filter(
      (account) => account.account.customer.toString() === publicKey.toString(),
    );
  }, [accounts.data, publicKey]);

  // Initialize form with freelancer data if available
  useMemo(() => {
    if (freelancer) {
      console.log('✅ Found cached freelancer data:', freelancer);
      setContractId(freelancer.paymentWalletAddress);
    } else {
      console.log('❌ No cached freelancer data found');
    }
  }, [freelancer]);

  const handleSubmitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      console.error('Wallet not connected');
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
      console.log('Signature:', signature);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-background">
        <CardContent className="p-6 space-y-8">
          {/* Payment Form Section - Show when freelancer data exists */}
          {
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Pay into Escrow</h2>
              <form onSubmit={handleSubmitPay} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contractId" className="text-sm font-medium">
                    Service Contract ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="contractId"
                      type="text"
                      placeholder="Enter contract ID"
                      value={contractId}
                      onChange={(e) => setContractId(e.target.value)}
                      className="w-full pr-10 border-neutral-200"
                      required
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Unique identifier for your service agreement</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Payment Amount (SOL)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="Enter amount in SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border-neutral-200"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="ml-2 text-sm">
                    I agree to release the funds once the service is completed
                    to my satisfaction.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={!agreed}>
                  Pay into Escrow
                </Button>
              </form>
            </div>
          }

          {/* Active Escrows Section - Always show */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Active Escrows</h2>
            <div className="space-y-4">{renderEscrowContent()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
