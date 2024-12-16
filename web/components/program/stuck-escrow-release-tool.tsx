'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/providers/solana-provider';
import { AppHero, ellipsify } from '@/ui/ui-layout';
import { ExplorerLink } from '@/cluster/cluster-ui';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { useState, useEffect } from 'react';

const DEFAULT_REGISTRY = '5cWUwSptpgm3yuxXuzFZh69mHWN6xN32LCCe5d4Fxxbz';

export default function StuckEscrowReleaseTool() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program } = useGigenticProgram();
  const [registryInput, setRegistryInput] = useState(DEFAULT_REGISTRY);
  const [isReleasing, setIsReleasing] = useState(false);
  const [escrows, setEscrows] = useState<
    Array<{
      address: string;
      programId: string;
      account: {
        customer: string;
        serviceProvider: string;
        feePercentage: number;
        expectedAmount: number;
        feeAccount: string;
      };
    }>
  >([]);

  useEffect(() => {
    async function fetchEscrows() {
      if (!program) return;

      try {
        const allEscrows = await program.account.escrow.all();
        console.log(`Found ${allEscrows.length} escrows`);

        const processedEscrows = [];
        for (const escrow of allEscrows) {
          try {
            processedEscrows.push({
              address: escrow.publicKey.toString(),
              programId: program.programId.toString(),
              account: {
                customer: escrow.account.customer.toString(),
                serviceProvider: escrow.account.serviceProvider.toString(),
                feePercentage: escrow.account.feePercentage,
                expectedAmount: escrow.account.expectedAmount.toNumber(),
                feeAccount: escrow.account.feeAccount.toString(),
              },
            });
          } catch (err) {
            console.warn(
              'Error processing escrow:',
              escrow.publicKey.toString(),
              err,
            );
          }
        }

        setEscrows(processedEscrows);
      } catch (err) {
        console.error('Error fetching escrows:', err);
      }
    }

    fetchEscrows();
  }, []);

  const attemptRelease = async (
    escrowAddress: string,
    registryAddress: string,
  ) => {
    if (!registryAddress || !publicKey) {
      alert('Please enter a service registry address to try');
      return;
    }

    setIsReleasing(true);

    console.log('Releasing escrow with ID:', escrowAddress);
    console.log('Using service registry:', registryAddress);

    // Fetch the escrow account first
    const escrow = await program.account.escrow.fetch(
      new PublicKey(escrowAddress),
    );

    if (!escrow) {
      throw new Error('Failed to fetch escrow account');
    }

    console.log('Fetched escrow:', {
      address: escrowAddress,
      serviceProvider: escrow.serviceProvider.toString(),
      customer: escrow.customer.toString(),
      expectedAmount: escrow.expectedAmount.toString(),
    });

    // Fetch service registry
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      new PublicKey(registryAddress),
    );

    if (!serviceRegistry || !serviceRegistry.serviceAccountAddresses) {
      throw new Error('Invalid service registry data');
    }

    console.log('Fetched registry:', {
      feeAccount: serviceRegistry.feeAccount.toString(),
      serviceCount: serviceRegistry.serviceAccountAddresses.length,
      addresses: serviceRegistry.serviceAccountAddresses.map((a) =>
        a.toString(),
      ),
    });

    // Find matching service account
    let serviceAccountPubKey: PublicKey | null = null;
    for (let i = 0; i < serviceRegistry.serviceAccountAddresses.length; i++) {
      const serviceAddress = serviceRegistry.serviceAccountAddresses[i];
      try {
        console.log(
          `\nChecking service account ${i + 1}/${serviceRegistry.serviceAccountAddresses.length}:`,
        );
        console.log('Service address:', serviceAddress.toString());

        const serviceAccount =
          await program.account.service.fetch(serviceAddress);

        console.log('Service provider:', serviceAccount.provider.toString());
        console.log('Looking for provider:', escrow.serviceProvider.toString());
        console.log(
          'Provider match?',
          serviceAccount.provider.toString() ===
            escrow.serviceProvider.toString(),
        );

        if (
          serviceAccount.provider.toString() ===
          escrow.serviceProvider.toString()
        ) {
          console.log('Found provider match, checking PDA derivation...');

          const [derivedEscrowPDA] = PublicKey.findProgramAddressSync(
            [
              Buffer.from('escrow'),
              serviceAddress.toBuffer(),
              serviceAccount.provider.toBuffer(),
              escrow.customer.toBuffer(),
            ],
            program.programId,
          );

          console.log('PDA check:', {
            derived: derivedEscrowPDA.toString(),
            actual: escrowAddress,
            match: derivedEscrowPDA.toString() === escrowAddress,
          });

          if (derivedEscrowPDA.toString() === escrowAddress) {
            serviceAccountPubKey = serviceAddress;
            console.log('Found complete match at index:', i);
            break;
          }
        }
      } catch (err) {
        console.warn('Error checking service account:', {
          address: serviceAddress.toString(),
          error: err instanceof Error ? err.message : String(err),
        });
        continue;
      }
    }

    if (!serviceAccountPubKey) {
      throw new Error('No matching service account found');
    }

    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash('confirmed');

    // Create and send the signService transaction
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [
        await program.methods
          .signService()
          .accounts({
            signer: publicKey,
            service: serviceAccountPubKey,
            serviceProvider: escrow.serviceProvider,
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

    console.log('Release successful! Transaction:', signature);
    alert('Release successful! Check the transaction in explorer.');
  };

  return publicKey ? (
    <div>
      <AppHero title="Stuck Escrow Release Tool" subtitle="Devnet">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold mb-2">Service Registry Input:</h3>
            <input
              type="text"
              className="input input-bordered w-full"
              value={registryInput}
              onChange={(e) => setRegistryInput(e.target.value)}
              placeholder="Enter service registry address to try..."
            />
          </div>

          <div>
            <h3 className="font-bold mb-2">Found Escrows:</h3>
            <div className="space-y-4">
              {escrows.map((escrow, i) => (
                <div key={i} className="p-4 bg-base-200 rounded-lg space-y-2">
                  <p>
                    <span className="font-semibold">Escrow Address:</span>{' '}
                    <ExplorerLink
                      path={`account/${escrow.address}`}
                      label={ellipsify(escrow.address)}
                    />
                  </p>
                  <p>
                    <span className="font-semibold">Program:</span>{' '}
                    <ExplorerLink
                      path={`account/${escrow.programId}`}
                      label={ellipsify(escrow.programId)}
                    />
                  </p>
                  <p>
                    <span className="font-semibold">Customer:</span>{' '}
                    <ExplorerLink
                      path={`account/${escrow.account.customer}`}
                      label={ellipsify(escrow.account.customer)}
                    />
                  </p>
                  <p>
                    <span className="font-semibold">Service Provider:</span>{' '}
                    <ExplorerLink
                      path={`account/${escrow.account.serviceProvider}`}
                      label={ellipsify(escrow.account.serviceProvider)}
                    />
                  </p>
                  <p>
                    <span className="font-semibold">Fee Percentage:</span>{' '}
                    {escrow.account.feePercentage}%
                  </p>
                  <p>
                    <span className="font-semibold">Expected Amount:</span>{' '}
                    {escrow.account.expectedAmount / LAMPORTS_PER_SOL} SOL
                  </p>
                  <p>
                    <span className="font-semibold">Fee Account:</span>{' '}
                    <ExplorerLink
                      path={`account/${escrow.account.feeAccount}`}
                      label={ellipsify(escrow.account.feeAccount)}
                    />
                  </p>
                  <button
                    className="btn btn-sm mt-2"
                    onClick={() =>
                      attemptRelease(escrow.address, registryInput)
                    }
                    disabled={isReleasing}
                  >
                    {isReleasing ? 'Releasing...' : 'Attempt Release'}
                  </button>
                </div>
              ))}
            </div>
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
