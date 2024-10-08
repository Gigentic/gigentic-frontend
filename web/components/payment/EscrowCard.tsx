import { Star } from 'lucide-react';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import Link from 'next/link';
import ReviewPopup from './ReviewPopup';

interface EscrowCardProps {
  providerName?: string;
  providerLink?: string;
  serviceId?: string;
  rating?: number;
  matchPercentage?: number;
  amountInEscrow?: number;
  totalAmount?: number;
  onReleaseEscrow?: () => void;
}

export default function EscrowCard({
  providerName = 'Provider',
  providerLink = 'https://www.solchat.app/',
  serviceId = '',
  rating = 0,
  matchPercentage,
  amountInEscrow,
  totalAmount,
  onReleaseEscrow,
}: EscrowCardProps) {
  const fullStars = Math.floor(rating);

  const handleRelease = () => {
    if (onReleaseEscrow) {
      onReleaseEscrow();
    } else {
      // Add nice popup here for giving a rating
      console.log('Yes! Release escrow');
    }
  };

  // const handleReleaseEscrow = async (escrowId: string) => {
  //   if (!publicKey) {
  //     console.error('Wallet not connected');
  //     return;
  //   }

  //   try {
  //     const escrowPubkey = new PublicKey(escrowId);

  //     // Create the transaction to release the escrow
  //     // This is a placeholder - you need to replace this with your actual program instruction
  //     const transaction = new Transaction()
  //       .add
  //       // Your program instruction to release the escrow
  //       ();

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     const signed = await sendTransaction(transaction, connection);
  //     console.log('Release transaction sent:', signed);

  //     const confirmation = await connection.confirmTransaction(
  //       signed,
  //       'confirmed',
  //     );
  //     if (confirmation.value.err) {
  //       throw new Error('Transaction failed to confirm');
  //     }

  //     transactionToast(signed);

  //     // Refresh the list of escrows
  //     fetchAllEscrows();
  //   } catch (error) {
  //     console.error('Error releasing escrow:', error);
  //   }
  // };

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <Link href={providerLink} className="font-medium hover:underline">
              {providerName}
            </Link>
            <p className="text-sm text-gray-500">Service ID: {serviceId}</p>
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                />
              ))}
              <span className="ml-1 text-sm font-medium">
                {rating.toFixed(1)}
              </span>
              {matchPercentage !== undefined && (
                <span className="ml-2 text-sm font-medium text-green-500">
                  {matchPercentage}% match
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm">
            Amount in Escrow: ${amountInEscrow?.toFixed(2) ?? '0.00'}
          </p>
          <p className="text-sm">
            Total Amount: ${totalAmount?.toFixed(2) ?? '0.00'}
          </p>
        </div>
        <ReviewPopup />
        <Button onClick={handleRelease} className="ml-4">
          Release Escrow
        </Button>
      </CardContent>
    </Card>
  );
}
