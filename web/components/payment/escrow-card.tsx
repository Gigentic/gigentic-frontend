import React from 'react';
import {
  Card,
  CardContent,
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
  TooltipContent,
} from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';
import { ReviewPopupDialog } from '../review/review-popup-dialog';

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
  const handleReviewSubmit = async ({
    rating,
    reviewText,
  }: {
    rating: number;
    reviewText: string;
  }) => {
    onReleaseEscrow(escrowId, rating, reviewText);
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`https://explorer.testnet.soo.network/address/${escrowId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline hover:text-primary whitespace-nowrap"
                  >
                    Amount in Escrow: {amountInEscrow.toFixed(3)} ETH
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to view escrow account on the blockchain explorer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <ReviewPopupDialog
            serviceTitle={serviceTitle}
            providerAddress={providerAddress}
            amount={amountInEscrow.toString()}
            onSubmit={handleReviewSubmit}
            buttonText="Release Escrow"
            buttonVariant="default"
          />
        </div>
      </CardContent>
    </Card>
  );
};
