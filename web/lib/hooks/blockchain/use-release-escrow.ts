import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useTransactionToast } from '@/components/ui/ui-layout';
import { useEscrowData } from '@/hooks/blockchain/use-escrow-data';
import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';

export function useReleaseEscrow() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const queryClient = useQueryClient();
  const { program } = useGigenticProgram();
  const { data: escrowData } = useEscrowData();
  const [error, setError] = useState<string | null>(null);

  const findServiceAccountIndex = async (
    serviceProvider: PublicKey,
    escrowId: string,
  ) => {
    // console.log(`Finding service account index for escrowId: ${escrowId}`);
    const escrow = escrowData?.escrows?.find(
      (e) => e.publicKey.toString() === escrowId,
    );
    if (!escrow) {
      console.error('Escrow not found:', escrowId);
      throw new Error('Escrow not found');
    }

    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryPubKey,
    );
    // console.log('Fetched service registry:', serviceRegistry);

    for (let i = 0; i < serviceRegistry.serviceAccountAddresses.length; i++) {
      const serviceAddress = serviceRegistry.serviceAccountAddresses[i];
      try {
        const serviceAccount =
          await program.account.service.fetch(serviceAddress);
        // console.log(`Fetched service account at index ${i}:`, serviceAccount);

        if (
          serviceAccount.provider.toString() ===
          escrow.account.serviceProvider.toString()
        ) {
          const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('escrow'),
              serviceAddress.toBuffer(),
              serviceAccount.provider.toBuffer(),
              escrow.account.customer.toBuffer(),
            ],
            program.programId,
          );
          // console.log('Derived Escrow PDA:', derivedEscrowPDA.toString());

          if (derivedEscrowPDA.toString() === escrowId) {
            console.log(
              `Matching service account ${serviceAddress.toString()} found at index ${i}`,
            );
            return i;
          }
        }
      } catch (fetchError) {
        console.error(
          `Error fetching service account at ${serviceAddress.toString()}:`,
          fetchError,
        );
      }
    }

    console.error('No matching service account found for escrowId:', escrowId);
    throw new Error('No matching service account found');
  };

  const handleReleaseEscrow = async (
    escrowId: string,
    serviceProvider: PublicKey,
    rating?: number,
    review?: string,
  ) => {
    if (!publicKey || !program) {
      throw new Error('Wallet not connected or program not initialized');
    }

    try {
      const serviceIndex = await findServiceAccountIndex(
        serviceProvider,
        escrowId,
      );
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );
      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[serviceIndex];

      // Fetch the service to get the review PDA
      const serviceAccount =
        await program.account.service.fetch(serviceAccountPubKey);
      if (!serviceAccount.reviews || serviceAccount.reviews.length === 0) {
        throw new Error('No review found for this service');
      }

      // Use the existing review PDA that was created during payService
      const reviewPubKey =
        serviceAccount.reviews[serviceAccount.reviews.length - 1];

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');

      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [
          // First instruction: Release escrow
          await program.methods
            .signService()
            .accounts({
              signer: publicKey,
              service: serviceAccountPubKey,
              serviceProvider: serviceProvider,
              feeAccount: serviceRegistry.feeAccount,
            })
            .instruction(),
          // Second instruction: Submit review
          await program.methods
            .customerToProviderRating(rating || 0, review || '')
            .accounts({
              signer: publicKey,
              review: reviewPubKey,
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

      // Invalidate both queries to refetch updated data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['escrow-data'] }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
      ]);

      return signature;
    } catch (err) {
      console.error('Error processing release and review:', err);
      setError('Failed to process release and review. Please try again.');
      throw err;
    }
  };

  return {
    handleReleaseEscrow,
    error,
  };
}
