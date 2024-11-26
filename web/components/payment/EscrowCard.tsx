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
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold text-lg">{serviceTitle}</h3>
                <Link
                  href={providerLink}
                  className="font-medium hover:underline"
                >
                  {providerName}
                </Link>
                <p className="text-sm text-gray-500">Escrow ID: {escrowId}</p>
                <div className="flex items-center mt-1">
                  {matchPercentage !== undefined && (
                    <span className="ml-2 text-sm font-medium text-green-500">
                      {matchPercentage}% match
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm">
                Amount in Escrow: {amountInEscrow.toFixed(3)} Sol
              </p>
            </div>
            <ReviewPopup
              escrowId={escrowId}
              serviceTitle={serviceTitle}
              providerName={providerName}
              amount={amountInEscrow.toFixed(2)}
              onSubmitReview={onReleaseEscrow}
            />
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
