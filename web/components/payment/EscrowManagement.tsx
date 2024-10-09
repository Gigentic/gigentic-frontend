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
  ParsedAccountData,
} from '@solana/web3.js';
import { useTransactionToast } from '../ui/ui-layout';

import { useGigenticProgram } from '../gigentic-frontend/gigentic-frontend-data-access';
import EscrowCard from './EscrowCard';
import MercuryoButton from './MercuryoButton';

// Mock data for open escrows
const openEscrows = [
  { id: 'ESC001', amount: 5, contractId: 'CNT123' },
  { id: 'ESC002', amount: 10, contractId: 'CNT456' },
  { id: 'ESC003', amount: 7.5, contractId: 'CNT789' },
];

export default function EscrowManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const transactionToast = useTransactionToast();

  //const { programId, accounts, getProgramAccount } = useGigenticProgram();
  // const { program, programId, getEscrowDetails } = useGigenticProgram();
  const { program, programId } = useGigenticProgram();
  const [userEscrows, setUserEscrows] = useState([]);

  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [title, setTitle] = useState('');
  const [avgRating, setAvgRating] = useState('');
  const [matchPercentage, setMatchPercentage] = useState('');

  // Later in your component...
  // const handleFetchEscrowDetails = async (escrowPubKey: PublicKey) => {
  //   const escrowDetails = await getEscrowDetails(escrowPubKey);
  //   if (escrowDetails) {
  //     // Do something with the escrow details
  //   }
  // };

  const fetchAllEscrows = useCallback(async () => {
    // if (!publicKey || !programId) return;

    try {
      // console.log('fetching all escrows');

      // console.log('accounts', accounts.data);
      // console.log('program', program);
      // console.log('programId', programId.toString());
      // console.log('connection', connection);
      // console.log('cluster', cluster);

      // Get the public key of the service account from the registry
      const serviceAccountPubKey = new PublicKey(
        'G7Z3mz6Q2KdKMp74N1b5YNkv2vB9A1TRVViQXRMkF4ey',
      );
      // const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

      // const serviceAccount =
      //   await program.account.service.fetch(serviceAccountPubKey);
      // console.log('FUUH Service Account:', serviceAccount);

      // // Find the program address for the escrow account
      // const [escrowPubKey, escrowBump] = PublicKey.findProgramAddressSync(
      //   [Buffer.from('escrow'), serviceAccountPubKey.toBuffer()],
      //   program.programId,
      // );

      // console.log('Escrow Pubkey:', escrowPubKey.toBase58());

      // mock allEscrows
      const allEscrows = [
        {
          pubkey: '123',
          amount: 10,
          serviceProvider: '456',
          buyer: '789',
        },
      ];

      setUserEscrows(allEscrows as any);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    }
    // }, [publicKey, programId, program]);
  }, []);

  useEffect(() => {
    if (publicKey && programId) {
      fetchAllEscrows();
    }
  }, [publicKey, programId, fetchAllEscrows]);

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
      const escrowPubkey = new PublicKey(contractId);
      const lamports = parseFloat(amount) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: escrowPubkey,
          lamports,
        }),
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await sendTransaction(transaction, connection);
      console.log('Transaction sent:', signed);

      const confirmation = await connection.confirmTransaction(
        signed,
        'confirmed',
      );
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signed);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const serviceRegistryPubKey = new PublicKey(
        'SAn6VFDzvDPGbD5yiDC7MDLCfRTwSqdM2Gg2kNqxZKT',
      );
      const serviceAccountPubKey = new PublicKey(
        'G7Z3mz6Q2KdKMp74N1b5YNkv2vB9A1TRVViQXRMkF4ey',
      );

      // Find the program address for the escrow account
      const [escrowPubKey] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), serviceAccountPubKey.toBuffer()],
        program.programId,
      );

      // Fetch the service registry account to get the fee account
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      // Create the transaction
      const transaction = await program.methods
        .signService()
        .accounts({
          signer: publicKey,
          service: serviceAccountPubKey,
          escrow: escrowPubKey,
          serviceProvider: serviceAccountPubKey,
          feeAccount: serviceRegistry.feeAccount,
          systemProgram: SystemProgram.programId,
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
      fetchAllEscrows();
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
