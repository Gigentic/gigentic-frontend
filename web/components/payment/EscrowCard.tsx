import { Star } from 'lucide-react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';
import ReviewPopup from '@/components/review/ReviewPopup';

interface EscrowCardProps {
  serviceTitle?: string;
  providerName: string;
  providerLink: string;
  escrowId: string;
  matchPercentage?: number;
  amountInEscrow: number;
  onReleaseEscrow: (escrowId: string, rating: number, review: string) => void;
}

export default function EscrowCard({
  serviceTitle,
  providerName,
  providerLink,
  escrowId,
  matchPercentage,
  amountInEscrow,
  onReleaseEscrow,
}: EscrowCardProps) {
  return (
    <Card className="w-full max-w-4xl bg-background">
      <CardContent className="flex items-center justify-between p-4">
        {serviceTitle ? (
          <>
            <div className="flex-1">
              <div>
                <Link
                  href={`https://explorer.testnet.soo.network/address/${providerName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-lg hover:underline hover:text-primary"
                >
                  {serviceTitle}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <Link
                href={`https://explorer.testnet.soo.network/address/${escrowId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:underline hover:text-primary whitespace-nowrap"
              >
                Amount in Escrow: {amountInEscrow.toFixed(3)} Sol
              </Link>
              <ReviewPopup
                escrowId={escrowId}
                serviceTitle={serviceTitle}
                providerName={providerName}
                amount={amountInEscrow.toFixed(2)}
                onSubmitReview={onReleaseEscrow}
              />
            </div>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <span className="animate-pulse text-muted-foreground">
              Loading escrow details...
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
