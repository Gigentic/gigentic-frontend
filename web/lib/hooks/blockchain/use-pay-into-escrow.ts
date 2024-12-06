import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { useSelectFreelancer } from '@/hooks/services/use-freelancer-query';

import { Freelancer } from '@/types/freelancer';

export function usePayIntoEscrow(
  selectedServiceAccountAddress: PublicKey | null,
) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const queryClient = useQueryClient();

  const { program } = useGigenticProgram();
  const { mutate: selectFreelancer } = useSelectFreelancer();
  const [error, setError] = useState<string | null>(null);

  const handlePayIntoEscrow = async () => {
    if (!publicKey || !selectedServiceAccountAddress) return;

    try {
      const review_id = new Date().getTime().toString().slice(0, 10);
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

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
      console.log('Transaction successful:', signature);

      selectFreelancer(null as unknown as Freelancer, {
        onSuccess: () => null,
        // console.log('✅ Freelancer cache cleared successfully'),
        onError: (err: unknown) =>
          console.error('❌ Failed to clear freelancer cache:', err),
      });

      await queryClient.invalidateQueries({
        queryKey: ['escrow-data'],
      });
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError('Failed to process payment. Please try again.');
    }
  };

  return {
    handlePayIntoEscrow,
    error,
  };
}
