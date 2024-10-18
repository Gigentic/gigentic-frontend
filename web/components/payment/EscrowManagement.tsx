'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useTransactionToast } from '../ui/ui-layout';

import { useGigenticProgram } from '../gigentic-frontend/gigentic-frontend-data-access';
import EscrowCard from './EscrowCard';
import MercuryoButton from './MercuryoButton';

export default function EscrowManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();

  const { program, programId } = useGigenticProgram();
  const [userEscrows, setUserEscrows] = useState([]);

  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState('');
  const [avgRating, setAvgRating] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');

  // TODO: remove this after testing
  const escrow_index = 5;

  // const fetchAllEscrows = useCallback(async () => {
  //   // if (!publicKey || !programId) return;

  //   console.log('Fetching all escrows');
  //   // try {
  //   //   const allEscrows: never[] = [];

  //   //   setUserEscrows(allEscrows as any);
  //   // } catch (error) {
  //   //   console.error('Error fetching escrows:', error);
  //   // }
  //   // }, [publicKey, programId, program]);
  // }, []);

  // useEffect(() => {
  //   if (publicKey && programId) {
  //     fetchAllEscrows();
  //   }
  // }, [publicKey, programId, fetchAllEscrows]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contractIdParam = params.get('contractId');
    const titleParam = params.get('title');
    const avgRatingParam = params.get('avgRating');
    const matchPercentageParam = params.get('matchPercentage');

    if (contractIdParam) {
      setContractId(contractIdParam);
    }
    if (titleParam) {
      setTitle(titleParam);
    }
    if (avgRatingParam) {
      setAvgRating(avgRatingParam);
    }
    if (matchPercentageParam) {
      setMatchPercentage(matchPercentageParam);
    }
  }, []);

  const handleSubmitPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      // TODO: get this from environment variables
      const serviceRegistryPubKey = new PublicKey(
        '6Gj3RPAsZPn9u9S5jVfh9AuvfaBR2mvDofec9nCbVAmA',
      );
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      // TODO: change this to the correct service account
      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[escrow_index];
      console.log('Service Account:', serviceAccountPubKey.toString());

      const transaction = new Transaction().add(
        await program.methods
          .payService()
          .accounts({
            buyer: publicKey,
            service: serviceAccountPubKey,
            serviceRegistry: serviceRegistryPubKey,
          })
          .instruction(),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signature);

      const confirmation = await connection.confirmTransaction(
        signature,
        'confirmed',
      );
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signature);

      // Find the program address for the escrow account
      const [escrowPubKey] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), serviceAccountPubKey.toBuffer()],
        program.programId,
      );

      // Fetch the escrow account details
      const escrowAccount = await program.account.escrow.fetch(escrowPubKey);
      console.log('Escrow account:', escrowAccount);

      // Update UI or state with escrow details if needed
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
    // TODO: read amount from the escrow account
    // setFinalAmount(amount);
    // setAmount('0');

    try {
      const serviceRegistryPubKey = new PublicKey(
        '6Gj3RPAsZPn9u9S5jVfh9AuvfaBR2mvDofec9nCbVAmA',
      );
      // Fetch the service registry account to get the fee account
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      // TODO: change this to the correct service account
      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[escrow_index];
      console.log(
        'Selected Service Account for transaction:',
        serviceAccountPubKey.toString(),
      );

      console.log('Service Account:', serviceAccountPubKey.toString());

      const [escrowPubKey] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), serviceAccountPubKey.toBuffer()],
        program.programId,
      );
      console.log('Escrow pubkey:', escrowPubKey.toString());

      try {
        const escrowAccount = await program.account.escrow.fetch(escrowPubKey);
        console.log('Escrow account data:', escrowAccount);
        console.log('Buyer:', escrowAccount.buyer.toString());
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
        console.log('---');
      } catch (error) {
        console.error(
          `Error fetching escrow account for service ${serviceAccountPubKey.toString()}:`,
          error,
        );
      }

      // Create the transaction
      const transaction = await program.methods
        .signService()
        .accounts({
          signer: publicKey,
          service: serviceAccountPubKey,
          serviceProvider: serviceAccountPubKey,
          feeAccount: serviceRegistry.feeAccount,
        })
        .transaction();

      // Send the transaction
      const signature = await sendTransaction(transaction, connection);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        signature,
        'confirmed',
      );

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signature);
      console.log('Escrow released successfully:', signature);

      // Refresh the list of escrows
      // fetchAllEscrows();
    } catch (error) {
      console.error('Error releasing escrow:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6">
          <Tabs defaultValue="pay" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="pay">Pay</TabsTrigger>
              <TabsTrigger value="release">Release</TabsTrigger>
            </TabsList>
            <TabsContent value="pay">
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
                      className="w-full pr-10"
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
                    className="w-full"
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
                    I agree to the terms and conditions
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={!agreed}>
                  Pay into Escrow
                </Button>
              </form>
              <div className="mt-4">
                <MercuryoButton />
              </div>
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

              {/* add a new card to show some info parsed from the contract from the blockchain */}
              <div className="flex items-center justify-between p-4 border rounded-lg"></div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
