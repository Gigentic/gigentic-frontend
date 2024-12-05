import React from 'react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { EscrowCard } from './EscrowCard';
import { EscrowAccount } from '@/lib/types/escrow';

interface EscrowListProps {
  escrows: {
    id: string;
    title: string;
    amount: string;
    provider: string;
  }[];
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
  isLoading,
  error,
  onReleaseEscrow,
}) => {
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

  if (escrows.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No active escrows found
      </div>
    );
  }

  return (
    <Card variant="default" size="lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Active Escrows
        </h2>
        <div className="space-y-4">
          {escrows.map((escrow) => (
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
      </CardContent>
    </Card>
  );
};
