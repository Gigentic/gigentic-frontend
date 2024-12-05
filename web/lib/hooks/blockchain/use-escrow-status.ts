import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { EscrowAccount } from '@/types/escrow';
import { useGigenticProgram } from './use-gigentic-program';
import { useEscrowData } from './use-escrow-data';

export const useEscrowStatus = (
  selectedServiceAccountAddress: PublicKey | null,
  publicKey: PublicKey | null,
) => {
  const [isServiceInEscrow, setIsServiceInEscrow] = useState(false);
  const { program } = useGigenticProgram();
  const { data: escrowData } = useEscrowData();
  useEffect(() => {
    let isSubscribed = true;

    if (!escrowData?.escrows || !selectedServiceAccountAddress || !publicKey) {
      setIsServiceInEscrow(false);
      return;
    }

    const checkServiceEscrow = async () => {
      try {
        // First get the service account to get its provider
        const serviceAccount = await program.account.service.fetch(
          selectedServiceAccountAddress,
        );

        // if (!isSubscribed || !accounts) {
        //   console.log('No escrows found');
        //   setIsServiceInEscrow(false);
        //   return;
        // }

        // // Now check all escrows
        // console.log(
        //   'Checking escrows:',
        //   accounts.map((escrow) => ({
        //     escrowPubkey: escrow.publicKey.toString(),
        //     serviceProvider: escrow.account.serviceProvider.toString(),
        //     customer: escrow.account.customer.toString(),
        //   })),
        // );

        // Derive the escrow PDA with the same seeds used in creation
        const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('escrow'),
            selectedServiceAccountAddress.toBuffer(),
            serviceAccount.provider.toBuffer(),
            publicKey.toBuffer(),
          ],
          program.programId,
        );
        // Check if this derived PDA exists in our escrows
        const existingEscrow = escrowData.escrows.find(
          (escrow) =>
            escrow.publicKey.toString() === derivedEscrowPDA.toString(),
        );

        console.log('Checking escrow status:', {
          serviceAccountAddress: selectedServiceAccountAddress.toString(),
          serviceProvider: serviceAccount.provider.toString(),
          customer: publicKey.toString(),
          derivedEscrowPDA: derivedEscrowPDA.toString(),
          hasExistingEscrow: !!existingEscrow,
        });

        if (isSubscribed) {
          setIsServiceInEscrow(!!existingEscrow);
        }
      } catch (error) {
        console.error('Error checking service escrow status:', error);
        if (isSubscribed) {
          setIsServiceInEscrow(false);
        }
      }
    };

    checkServiceEscrow();

    return () => {
      isSubscribed = false;
    };
  }, [selectedServiceAccountAddress, publicKey, escrowData, program]);

  return isServiceInEscrow;
};
