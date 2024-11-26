import { Star } from 'lucide-react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';
import ReviewPopup from '@/components/review/ReviewPopup';
import { SetStateAction } from 'react';

interface EscrowCardProps {
  serviceTitle?: string;
  providerName?: string;
  providerLink?: string;
  escrowId?: string;
  rating?: number;
  matchPercentage?: number;
  amountInEscrow?: number;
  totalAmount?: number;
  onReleaseEscrow?: () => void;
}

export default function EscrowCard({
  serviceTitle,
  providerName = 'Provider',
  providerLink = 'https://www.solchat.app/',
  escrowId = '',
  rating = 0,
  matchPercentage,
  amountInEscrow,
  totalAmount,
  onReleaseEscrow,
}: EscrowCardProps) {
  const handleRelease = (contractId: string) => {
    if (onReleaseEscrow) {
      onReleaseEscrow();
    } else {
      console.log('onReleaseEscrow not provided');
    }
  };

  function setIsOpen(value: SetStateAction<boolean>): void {
    throw new Error('Function not implemented.');
  }

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
                  <span className="ml-1 text-sm font-medium">⭐ 4.6</span>
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
                Amount in Escrow: {amountInEscrow?.toFixed(3) ?? '0.000'} Sol
              </p>
            </div>
            <ReviewPopup
              setIsOpen={setIsOpen}
              contractId={escrowId}
              serviceName={providerName}
              amount={amountInEscrow?.toFixed(2) ?? '0.00'}
              provider={providerName}
              onReleaseEscrow={handleRelease}
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
