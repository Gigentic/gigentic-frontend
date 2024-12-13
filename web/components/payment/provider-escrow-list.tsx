import React from 'react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Link from 'next/link';

interface ProviderEscrowProps {
  escrows: {
    id: string;
    title: string;
    amount: string;
    customer: string;
  }[];
  isLoading: boolean;
  error: string;
}

export const ProviderEscrowList: React.FC<ProviderEscrowProps> = ({
  escrows,
  isLoading,
  error,
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
        No pending escrows found
      </div>
    );
  }

  return (
    <Card variant="default" size="lg">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          Pending Escrows
        </h2>
        <div className="space-y-4">
          {escrows.map((escrow) => (
            <Card key={escrow.id} className="mb-4">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{escrow.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer:{' '}
                      <Link
                        href={`https://www.solchat.app/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline hover:text-primary"
                      >
                        {escrow.customer}
                      </Link>
                    </p>
                    <p className="text-sm">
                      Amount to Receive:{' '}
                      {Number(escrow.amount) / LAMPORTS_PER_SOL} SOL
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                    Pending
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
