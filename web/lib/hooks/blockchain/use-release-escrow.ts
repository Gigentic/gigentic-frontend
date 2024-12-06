import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { useServiceLookup } from '@/hooks/blockchain/use-service-lookup';
import { useFeeAccount } from '@/hooks/blockchain/use-service-registry';

export function useReleaseEscrow() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const queryClient = useQueryClient();
  const { program } = useGigenticProgram();
  const feeAccountPubKey = useFeeAccount();
  const [error, setError] = useState<string | null>(null);
  const { data: serviceLookupMap } = useServiceLookup();

  const handleReleaseEscrow = async (
    escrowId: string,
    serviceProvider: PublicKey,
    rating?: number,
    review?: string,
  ) => {
    if (!publicKey || !serviceLookupMap) return;

    try {
      const serviceInfo = serviceLookupMap[escrowId];
      if (!serviceInfo) {
        throw new Error('Service not found for escrow');
      }

      const { serviceAccountPubkey } = serviceInfo;

      console.log('serviceAccountPubkey', serviceAccountPubkey.toString());
      console.log('feeAccountPubKey', feeAccountPubKey?.toString());

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      if (!feeAccountPubKey) {
        throw new Error('Fee account not found');
      }

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          await program.methods
            .signService()
            .accounts({
              signer: publicKey,
              service: serviceAccountPubkey,
              serviceProvider: serviceProvider,
              feeAccount: feeAccountPubKey,
            })
            .instruction(),
        ],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const signature = await sendTransaction(transaction, connection);
      console.log('Release transaction signature:', signature);

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
      console.log('Release transaction confirmed:', signature);

      await queryClient.invalidateQueries({
        queryKey: ['escrow-data'],
      });
    } catch (err) {
      console.error('Error releasing escrow and submitting review:', err);
      setError('Failed to process release. Please try again.');
    }
  };

  return {
    handleReleaseEscrow,
    error,
  };
}
