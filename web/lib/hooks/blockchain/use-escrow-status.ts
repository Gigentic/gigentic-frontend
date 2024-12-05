import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { EscrowAccount } from '@/types/escrow';
import { useGigenticProgram } from './use-gigentic-program';

export const useEscrowStatus = (
  selectedServiceAccountAddress: PublicKey | null,
  publicKey: PublicKey | null,
  accounts: EscrowAccount[] | undefined,
) => {
  const [isServiceInEscrow, setIsServiceInEscrow] = useState(false);
  const { program } = useGigenticProgram();

  useEffect(() => {
    if (!accounts || !selectedServiceAccountAddress || !publicKey) {
      setIsServiceInEscrow(false);
      return;
    }

    const checkServiceEscrow = async () => {
      try {
        // First get the service account to get its provider
        const serviceAccount = await program.account.service.fetch(
          selectedServiceAccountAddress,
        );

        if (!accounts) {
          console.log('No escrows found');
          setIsServiceInEscrow(false);
          return;
        }

        // Now check all escrows
        console.log(
          'Checking escrows:',
          accounts.map((escrow) => ({
            escrowPubkey: escrow.publicKey.toString(),
            serviceProvider: escrow.serviceProvider.toString(),
            customer: escrow.customer.toString(),
          })),
        );

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
        const existingEscrow = accounts.find(
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

        setIsServiceInEscrow(!!existingEscrow);
      } catch (error) {
        console.error('Error checking service escrow status:', error);
        setIsServiceInEscrow(false);
      }
    };

    checkServiceEscrow();
  }, [accounts, selectedServiceAccountAddress, publicKey, program]);

  return isServiceInEscrow;
};
