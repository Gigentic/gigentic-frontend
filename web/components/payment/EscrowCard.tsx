import {
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';
import ReviewPopup from '@/components/review/ReviewPopup';

interface EscrowCardProps {
  serviceTitle?: string;
  providerAddress: string;
  providerLink: string;
  escrowId: string;
  matchPercentage?: number;
  amountInEscrow: number;
  onReleaseEscrow: (escrowId: string, rating: number, review: string) => void;
}

export default function EscrowCard({
  serviceTitle,
  providerAddress,
  providerLink,
  escrowId,
  matchPercentage,
  amountInEscrow,
  onReleaseEscrow,
}: EscrowCardProps) {
  return (
    <Card className="w-full max-w-4xl bg-gray-50 shadow-md">
      <CardContent className="flex items-center justify-between p-4">
        {serviceTitle ? (
          <>
            <div className="flex-1">
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`https://explorer.testnet.soo.network/address/${providerAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-lg hover:underline hover:text-primary"
                      >
                        {serviceTitle}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to view on Explorer</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex items-center gap-10">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={`https://explorer.testnet.soo.network/address/${escrowId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline hover:text-primary whitespace-nowrap"
                    >
                      Amount in Escrow: {amountInEscrow.toFixed(3)} Sol
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to view on Explorer</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ReviewPopup
                escrowId={escrowId}
                serviceTitle={serviceTitle}
                providerName={providerAddress}
                amount={amountInEscrow.toFixed(3)}
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
