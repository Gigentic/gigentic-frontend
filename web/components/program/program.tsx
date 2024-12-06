'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/providers/solana-provider';
import { AppHero, ellipsify } from '@/ui/ui-layout';
import { ExplorerLink } from '@/cluster/cluster-ui';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';

export default function GigenticProgramFeature() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { programId } = useGigenticProgram();
  const [escrowData, setEscrowData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function findAllEscrows() {
      if (!publicKey) return;

      setLoading(true);
      try {
        // Find all accounts owned by the wallet
        const accounts = await connection.getParsedProgramAccounts(programId, {
          filters: [
            {
              memcmp: {
                offset: 8, // Skip discriminator
                bytes: publicKey.toBase58(),
              },
            },
          ],
        });

        const escrowDetails = accounts.map((acc) => ({
          pubkey: acc.pubkey.toString(),
          data: acc.account.data,
          owner: acc.account.owner.toString(),
        }));

        setEscrowData(escrowDetails);
      } catch (err) {
        console.error('Error fetching escrows:', err);
      }
      setLoading(false);
    }

    findAllEscrows();
  }, [publicKey, connection, programId]);

  return publicKey ? (
    <div>
      <AppHero title="Gigentic Program Explorer" subtitle="Program Details">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">Current Program ID:</h3>
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </div>

          <div>
            <h3 className="font-bold">Your Wallet:</h3>
            <p>{ellipsify(publicKey.toString())}</p>
          </div>

          <div>
            <h3 className="font-bold">Found Escrows:</h3>
            {loading ? (
              <p>Loading escrows...</p>
            ) : (
              <div className="space-y-2">
                {escrowData.map((escrow, i) => (
                  <div key={i} className="p-4 bg-base-200 rounded-lg">
                    <p>Escrow Address: {escrow.pubkey}</p>
                    <p>Program Owner: {escrow.owner}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
