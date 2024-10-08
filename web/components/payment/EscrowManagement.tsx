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
  const { programId, accounts, getProgramAccount } = useGigenticProgram();

  const [contractId, setContractId] = useState('');
  const [amount, setAmount] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [userEscrows, setUserEscrows] = useState([]);

  const fetchAllEscrows = useCallback(async () => {
    if (!publicKey || !programId) return;

    try {
      const accounts = await connection.getParsedProgramAccounts(programId, {
        filters: [
          { dataSize: 165 }, // Adjust this size based on your Escrow struct size
        ],
      });

      const allEscrows = accounts.map((account) => {
        const parsedData = (account.account.data as ParsedAccountData).parsed;
        return {
          pubkey: account.pubkey,
          amount: parsedData.info.expectedAmount / LAMPORTS_PER_SOL,
          serviceProvider: parsedData.info.serviceProvider,
          buyer: parsedData.info.buyer,
        };
      });

      setUserEscrows(allEscrows as any);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    }
  }, [publicKey, programId, connection]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contractIdParam = params.get('contractId');
    if (contractIdParam) {
      setContractId(contractIdParam);
    }
  }, []);

  useEffect(() => {
    if (publicKey && programId) {
      fetchAllEscrows();
    }
  }, [publicKey, programId, fetchAllEscrows]);

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

  const handleBuySol = () => {
    console.log('Initiating SOL purchase process');
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    try {
      const escrowPubkey = new PublicKey(escrowId);

      // Create the transaction to release the escrow
      // This is a placeholder - you need to replace this with your actual program instruction
      const transaction = new Transaction()
        .add
        // Your program instruction to release the escrow
        ();

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signed = await sendTransaction(transaction, connection);
      console.log('Release transaction sent:', signed);

      const confirmation = await connection.confirmTransaction(
        signed,
        'confirmed',
      );
      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      transactionToast(signed);

      // Refresh the list of escrows
      fetchAllEscrows();
    } catch (error) {
      console.error('Error releasing escrow:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleBuySol}
                        className="w-full"
                        variant="outline"
                      >
                        Buy SOL
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Purchase SOL, the native cryptocurrency of the Solana
                        blockchain, required for transactions on Gigentic
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TabsContent>
            <TabsContent value="release">
              <div className="space-y-4">
                {userEscrows.length === 0 ? (
                  <div>
                    <EscrowCard />

                    <EscrowCard
                      providerName="John Doe"
                      providerLink="https://www.solchat.app/"
                      serviceId="SRV123"
                      rating={11.1}
                      matchPercentage={90}
                      amountInEscrow={500}
                      totalAmount={1000}
                      onReleaseEscrow={() => console.log('Escrow released')}
                    />

                    <p>No active escrows found.</p>
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                data
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
