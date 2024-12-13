import React from 'react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { EscrowCard } from './escrow-card';
import { useWallet } from '@solana/wallet-adapter-react';

interface EscrowListProps {
  escrows: {
    publicKey: PublicKey;
    account: {
      customer: PublicKey;
      serviceProvider: PublicKey;
      expectedAmount: number;
    };
  }[];
  titles: Record<string, string>;
  isLoading: boolean;
  error: string;
  onReleaseEscrow: (
    escrowId: string,
    serviceProvider: PublicKey,
    rating?: number,
    review?: string,
  ) => void;
}

export const EscrowList: React.FC<EscrowListProps> = ({
  escrows,
  titles,
  isLoading,
  error,
  onReleaseEscrow,
}) => {
  const { publicKey } = useWallet();

  // Filter escrows where the current user is the customer
  const userEscrows =
    publicKey && escrows.length > 0
      ? escrows
          .filter(
            (escrow) =>
              escrow.account.customer.toString() === publicKey.toString(),
          )
          .map((escrow) => ({
            id: escrow.publicKey.toString(),
            title: titles[escrow.publicKey.toString()],
            amount: escrow.account.expectedAmount.toString(),
            provider: escrow.account.serviceProvider.toString(),
          }))
      : [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  if (userEscrows.length === 0) {
    return (
      <div className="text-center py-12 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No Active Escrows</h3>
        <p className="text-muted-foreground">
          You haven't paid into any escrows yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userEscrows.map((escrow) => (
        <EscrowCard
          key={escrow.id}
          serviceTitle={escrow.title}
          providerAddress={escrow.provider}
          providerLink={`https://www.solchat.app/`}
          escrowId={escrow.id}
          amountInEscrow={Number(escrow.amount) / LAMPORTS_PER_SOL}
          onReleaseEscrow={(escrowId, rating, review) =>
            onReleaseEscrow(
              escrowId,
              new PublicKey(escrow.provider),
              rating,
              review,
            )
          }
        />
      ))}
    </div>
  );
};
