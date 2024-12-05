import { useState } from 'react';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useTransactionToast } from '@/components/ui/ui-layout';

import { useEscrowAccounts } from '@/hooks/blockchain/use-escrow-accounts';
import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { useSelectFreelancer } from '@/hooks/services/use-freelancer-query';

import { Freelancer } from '@/lib/types/freelancer';

export const useTransactionHandlers = (
  selectedServiceAccountAddress: PublicKey | null,
) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();

  const { program } = useGigenticProgram();
  const { accounts } = useEscrowAccounts();
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
      accounts.refetch();

      selectFreelancer(null as unknown as Freelancer, {
        onSuccess: () =>
          console.log('✅ Freelancer cache cleared successfully'),
        onError: (err: unknown) =>
          console.error('❌ Failed to clear freelancer cache:', err),
      });
    } catch (err) {
      console.error('Error sending transaction:', err);
      setError('Failed to process payment. Please try again.');
    }
  };

  const findServiceAccountIndex = async (
    serviceProvider: PublicKey,
    escrowId: string,
  ) => {
    const escrow = accounts.data?.find(
      (e) => e.publicKey.toString() === escrowId,
    );
    if (!escrow) throw new Error('Escrow not found');

    const serviceRegistry = await program.account.serviceRegistry.fetch(
      serviceRegistryPubKey,
    );

    for (let i = 0; i < serviceRegistry.serviceAccountAddresses.length; i++) {
      const serviceAddress = serviceRegistry.serviceAccountAddresses[i];
      const serviceAccount =
        await program.account.service.fetch(serviceAddress);

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

        if (derivedEscrowPDA.toString() === escrowId) {
          return i;
        }
      }
    }

    throw new Error('No matching service account found');
  };

  const handleReleaseEscrow = async (
    escrowId: string,
    serviceProvider: PublicKey,
    rating?: number,
    review?: string,
  ) => {
    if (!publicKey) return;

    try {
      const serviceIndex = await findServiceAccountIndex(
        serviceProvider,
        escrowId,
      );
      const escrow = accounts.data?.find(
        (e) => e.publicKey.toString() === escrowId,
      );
      if (!escrow) throw new Error('Escrow not found');

      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );
      const serviceAccountPubKey =
        serviceRegistry.serviceAccountAddresses[serviceIndex];

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
              serviceProvider: serviceProvider,
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
    } catch (err) {
      console.error('Error releasing escrow and submitting review:', err);
      setError('Failed to process release and review. Please try again.');
    }
  };

  return {
    handlePayIntoEscrow,
    handleReleaseEscrow,
    error,
  };
};
