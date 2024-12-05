import { useState, useCallback, useRef, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useEscrowAccounts } from '@/lib/hooks/blockchain/use-escrow-accounts';
import { serviceRegistryPubKey } from '@/lib/hooks/blockchain/use-service-registry';
import { Escrow } from '@/lib/types/escrow';

function extractServiceTitle(description: string): string {
  const titleMatch = description.match(/title: (.*?) \|/);
  return titleMatch ? titleMatch[1] : 'Unnamed Service';
}

const RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 3;

export const useServiceTitles = (userEscrows: Escrow[]) => {
  const [serviceTitles, setServiceTitles] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const { program } = useEscrowAccounts();
  const titlesCache = useRef<Record<string, string>>({});
  const fetchTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  const fetchServiceTitles = useCallback(async () => {
    if (!userEscrows.length) return;

    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check cache first
    const uncachedEscrows = userEscrows.filter(
      (escrow) => !titlesCache.current[escrow.publicKey.toString()],
    );

    if (uncachedEscrows.length === 0) {
      setServiceTitles(titlesCache.current);
      return;
    }

    try {
      const serviceRegistry = await program.account.serviceRegistry.fetch(
        serviceRegistryPubKey,
      );

      // Batch fetch all service accounts
      const serviceAccounts = await Promise.all(
        serviceRegistry.serviceAccountAddresses.map((address) =>
          program.account.service
            .fetch(address)
            .then((account) => ({ address, account }))
            .catch((err) => {
              console.error(
                `Error fetching service account ${address.toString()}:`,
                err,
              );
              return null;
            }),
        ),
      ).then((results) => results.filter(Boolean));

      const newTitles: Record<string, string> = { ...titlesCache.current };

      for (const escrow of uncachedEscrows) {
        const escrowId = escrow.publicKey.toString();
        const matchingService = serviceAccounts.find((serviceAccount) => {
          if (!serviceAccount) return false;
          const { address, account } = serviceAccount;
          try {
            const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
              [
                Buffer.from('escrow'),
                address.toBuffer(),
                escrow.account.serviceProvider.toBuffer(),
                escrow.account.customer.toBuffer(),
              ],
              program.programId,
            );
            return derivedEscrowPDA.toString() === escrowId;
          } catch (err) {
            console.error('Error deriving escrow PDA:', err);
            return false;
          }
        });

        if (matchingService?.account) {
          newTitles[escrowId] = extractServiceTitle(
            matchingService.account.description,
          );
        }
      }

      // Update cache and state
      titlesCache.current = newTitles;
      setServiceTitles(newTitles);
      retryCountRef.current = 0; // Reset retry count on success
      setError(null);
    } catch (err) {
      console.error('Error fetching service titles:', err);

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        const delay = RETRY_DELAY * retryCountRef.current;
        console.log(
          `Retrying after ${delay}ms (attempt ${retryCountRef.current}/${MAX_RETRIES})`,
        );

        fetchTimeoutRef.current = setTimeout(() => {
          fetchServiceTitles();
        }, delay);
      } else {
        setError('Failed to load escrow details after multiple retries');
      }
    }
  }, [userEscrows, program]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  return { serviceTitles, error, fetchServiceTitles };
};
