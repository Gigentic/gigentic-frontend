'use client';

import { useEffect, useState } from 'react';
import { InfoIcon } from 'lucide-react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { useTransactionToast } from '../ui/ui-layout';

import { useGigenticProgram } from '../gigentic-frontend/gigentic-frontend-data-access';
import EscrowCard from './EscrowCard';
import { useSelectedFreelancer } from '@/hooks/services/use-freelancer-query';

export default function EscrowManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();

  const { program } = useGigenticProgram();
  const { data: freelancer } = useSelectedFreelancer();

  const [userEscrows, setUserEscrows] = useState([]);
  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState('');
  const [avgRating, setAvgRating] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');

  // TODO: this should be in the global state that identifies which service account to use for creating the escrow
  const serviceAccountIndex = 0;

  useEffect(() => {
    if (freelancer) {
      console.log('✅ Found cached freelancer data:', freelancer);
      // this should be aligned with the service account index
      setContractId(freelancer.paymentWalletAddress);
      setTitle(freelancer.title);
      setAvgRating(freelancer.rating.toString());
      setMatchPercentage(freelancer.matchScore.toString());
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
      // TODO: get this from environment variables
      const serviceRegistryPubKey = new PublicKey(
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
      );

      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[serviceAccountIndex];
      console.log('Service Account:', serviceAccountPubKey.toString());

      // Generate a unique review_id that is max 10 digits (e.g., using timestamp or UUID)
      const review_id = new Date().getTime().toString().slice(0, 10);
      console.log('Review ID:', review_id);

      // Inside handleSubmitPay function
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      // Create a new TransactionMessage
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

      // Create a new VersionedTransaction
      const transaction = new VersionedTransaction(messageV0);

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      // Confirm using the new pattern
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

      const serviceAccount =
        await program.account.service.fetch(serviceAccountPubKey);

      // Derive Escrow PDA
      const [escrowPubKey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('escrow'),
          serviceAccountPubKey.toBuffer(),
          serviceAccount.provider.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );

      // Fetch the escrow account details
      console.log('Escrow pubkey:', escrowPubKey.toString());
      const escrowAccount = await program.account.escrow.fetch(escrowPubKey);
      console.log('Escrow customer:', escrowAccount.customer.toString());
      console.log(
        'Escrow service provider:',
        escrowAccount.serviceProvider.toString(),
      );
      console.log('Escrow fee percentage:', escrowAccount.feePercentage);
      console.log(
        'Escrow expected amount:',
        escrowAccount.expectedAmount.toString(),
      );
      console.log('Escrow fee account:', escrowAccount.feeAccount.toString());

      // // Derive Review PDA
      // const [reviewPubKey] = PublicKey.findProgramAddressSync(
      //   [
      //     Buffer.from('review'),
      //     Buffer.from(review_id),
      //     serviceAccountPubKey.toBuffer(),
      //   ],
      //   program.programId,
      // );
      // console.log('Review pubkey:', reviewPubKey.toString());
      // const reviewAccount = await program.account.review.fetch(reviewPubKey);
      // console.log('Review account:', reviewAccount);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    console.log('Releasing escrow:', escrowId);
    // TODO: update / fix UI

    try {
      // Retrieve the service registry public key from environment variables
      const serviceRegistryPubKeyString =
        process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY;

      if (!serviceRegistryPubKeyString) {
        throw new Error(
          'NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY is not defined in environment variables',
        );
      }

      const serviceRegistryPubKey = new PublicKey(serviceRegistryPubKeyString);
      // Fetch the service registry account to get the fee account
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[serviceAccountIndex];

      console.log('Service Account:', serviceAccountPubKey.toString());

      const serviceAccount =
        await program.account.service.fetch(serviceAccountPubKey);

      // Derive Escrow PDA with the correct seeds
      const [escrowPubKey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('escrow'),
          serviceAccountPubKey.toBuffer(),
          serviceAccount.provider.toBuffer(),
          publicKey.toBuffer(),
        ],
        program.programId,
      );
      console.log('Escrow pubkey:', escrowPubKey.toString());

      try {
        const escrowAccount = await program.account.escrow.fetch(escrowPubKey);
        console.log('Escrow account data:', escrowAccount);
        console.log('customer:', escrowAccount.customer.toString());
        console.log(
          'Service Provider:',
          escrowAccount.serviceProvider.toString(),
        );
        console.log('Fee Percentage:', escrowAccount.feePercentage);
        console.log(
          'Expected Amount:',
          escrowAccount.expectedAmount.toString(),
        );
        console.log('Fee Account:', escrowAccount.feeAccount.toString());
      } catch (error) {
        console.error(
          `Error fetching escrow account for service ${serviceAccountPubKey.toString()}:`,
          error,
        );
      }

      // Inside handleSubmitPay function
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      // Create a new TransactionMessage
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

      // Create a new VersionedTransaction
      const transaction = new VersionedTransaction(messageV0);

      // Send transaction
      const signature = await sendTransaction(transaction, connection);

      // Confirm using the new pattern
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
      console.log('Escrow released successfully:', signature);
    } catch (error) {
      console.error('Error releasing escrow:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleCheckCache = () => {
    console.log('🔍 Checking cache in Payment page');
    console.log('💾 Cached freelancer data:', freelancer);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-background">
        <CardContent className="p-6">
          <Tabs defaultValue="pay" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pay">Pay</TabsTrigger>
              <TabsTrigger value="release">Release</TabsTrigger>
            </TabsList>
            <TabsContent value="pay">
              <form onSubmit={handleSubmitPay} className="space-y-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full mb-4"
                  onClick={handleCheckCache}
                >
                  Check Cache
                </Button>
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
            </TabsContent>
            <TabsContent value="release">
              <div className="space-y-4">
                {userEscrows.length === 0 ? ( // in case there is no data; default as currently reading from blockchain is not working
                  <div>
                    <EscrowCard
                      providerName={title}
                      providerLink="https://www.solchat.app/"
                      serviceId={contractId.slice(0, 8) + '...'}
                      rating={Number(avgRating)}
                      matchPercentage={Number(matchPercentage)}
                      amountInEscrow={Number(amount)}
                      totalAmount={Number(finalAmount)}
                      onReleaseEscrow={() => handleReleaseEscrow(contractId)}
                    />
                  </div>
                ) : (
                  userEscrows.map((escrow: any) => (
                    <EscrowCard
                      key={escrow.pubkey.toString()}
                      providerName={`Provider ${escrow.serviceProvider.slice(0, 8)}...`}
                      serviceId={escrow.pubkey.toString().slice(0, 8)}
                      amountInEscrow={escrow.amount}
                      onReleaseEscrow={() =>
                        handleReleaseEscrow(escrow.pubkey.toString())
                      }
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
