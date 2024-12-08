'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import {
  TransactionMessage,
  VersionedTransaction,
  PublicKey,
} from '@solana/web3.js';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { useGigenticProgram } from './use-gigentic-program';
import { ReviewSubmitData } from '@/types/review';

export function useReviewSubmission() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const queryClient = useQueryClient();
  const { program } = useGigenticProgram();

  const submitReview = async (data: ReviewSubmitData) => {
    if (!publicKey || !program) {
      throw new Error('Wallet not connected or program not initialized');
    }

    try {
      // Derive the review PDA
      const [reviewPubKey] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('review'),
          Buffer.from(data.reviewId),
          data.serviceAccount.toBuffer(),
        ],
        program.programId,
      );

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          await program.methods[
            data.role === 'customer'
              ? 'customerToProviderRating'
              : 'providerToCustomerRating'
          ](data.rating, data.reviewText)
            .accounts({
              signer: publicKey,
              review: reviewPubKey,
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
      console.log('Review submitted:', data);
      // Invalidate reviews query to refetch the updated data
      await queryClient.invalidateQueries({
        queryKey: ['reviews'],
      });

      return signature;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  return { submitReview };
}
