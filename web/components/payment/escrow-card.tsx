import React from 'react';
import { Card, CardContent, Button } from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';

interface EscrowCardProps {
  serviceTitle: string;
  providerAddress: string;
  providerLink: string;
  escrowId: string;
  amountInEscrow: number;
  onReleaseEscrow: (escrowId: string, rating?: number, review?: string) => void;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  serviceTitle,
  providerAddress,
  providerLink,
  escrowId,
  amountInEscrow,
  onReleaseEscrow,
}) => {
  const handleRelease = () => {
    // For now, we'll use default values. In a real implementation,
    // you might want to show a modal to collect rating and review.
    const rating = 5;
    const review = 'Great service!';
    onReleaseEscrow(escrowId, rating, review);
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{serviceTitle}</h3>
            <p className="text-sm text-muted-foreground">
              Provider:{' '}
              <Link
                href={providerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-primary"
              >
                {providerAddress}
              </Link>
            </p>
            <p className="text-sm">Amount in Escrow: {amountInEscrow} SOL</p>
          </div>
          <Button onClick={handleRelease} variant="default">
            Release Escrow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
