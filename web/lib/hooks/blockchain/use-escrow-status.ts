import { useState, useEffect, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrowAccounts } from '@/lib/hooks/blockchain/use-escrow-accounts';

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

export const useEscrowStatus = (
  selectedServiceAccountAddress: PublicKey | null,
  publicKey: PublicKey | null,
) => {
  const [isServiceInEscrow, setIsServiceInEscrow] = useState(false);
  const { accounts, program } = useEscrowAccounts();
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastCheckedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!accounts.data || !selectedServiceAccountAddress || !publicKey) {
      setIsServiceInEscrow(false);
      return;
    }

    // Create a cache key from the current parameters
    const cacheKey = `${selectedServiceAccountAddress.toString()}-${publicKey.toString()}`;

    // If we've already checked this combination and have accounts data, skip
    if (lastCheckedRef.current === cacheKey && accounts.data.length > 0) {
      return;
    }

    const checkServiceEscrow = async () => {
      try {
        const serviceAccount = await program.account.service.fetch(
          selectedServiceAccountAddress,
        );

        const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('escrow'),
            selectedServiceAccountAddress.toBuffer(),
            serviceAccount.provider.toBuffer(),
            publicKey.toBuffer(),
          ],
          program.programId,
        );

        const existingEscrow = accounts.data.find(
          (escrow) =>
            escrow.publicKey.toString() === derivedEscrowPDA.toString(),
        );

        setIsServiceInEscrow(!!existingEscrow);
        retryCountRef.current = 0; // Reset retry count on success
        lastCheckedRef.current = cacheKey;
      } catch (error) {
        console.error('Error checking service escrow status:', error);

        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          const delay = RETRY_DELAY * retryCountRef.current;
          console.log(
            `Retrying escrow status check after ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`,
          );

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = setTimeout(checkServiceEscrow, delay);
        } else {
          setIsServiceInEscrow(false);
          console.error('Failed to check escrow status after multiple retries');
        }
      }
    };

    checkServiceEscrow();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [accounts.data, selectedServiceAccountAddress, publicKey, program]);

  return isServiceInEscrow;
};
