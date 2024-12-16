import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
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
        // console.log('Checking escrow status for:', {
        //   selectedServiceAccountAddress:
        //     selectedServiceAccountAddress.toString(),
        //   publicKey: publicKey.toString(),
        // });

        // Fetch the service account to get its provider
        const serviceAccount = await program.account.service.fetch(
          selectedServiceAccountAddress,
        );
        // console.log(
        //   'Fetched service account for escrow status:',
        //   serviceAccount,
        // );

        const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('escrow'),
            selectedServiceAccountAddress.toBuffer(),
            serviceAccount.provider.toBuffer(),
            publicKey.toBuffer(),
          ],
          program.programId,
        );
        // console.log(
        //   'Derived Escrow PDA for status check:',
        //   derivedEscrowPDA.toString(),
        // );

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
        // console.log('Existing Escrow:', existingEscrow?.publicKey.toString());

        if (isSubscribed) {
          setIsServiceInEscrow(!!existingEscrow);
          // console.log('Service is in escrow:', !!existingEscrow);
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
