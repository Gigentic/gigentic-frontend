'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/providers/solana-provider';
import { AppHero, ellipsify } from '@/ui/ui-layout';
import { ExplorerLink } from '@/cluster/cluster-ui';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';
import { useReviewsV1 } from '@/hooks/blockchain/use-reviews-v1';

export default function GigenticProgramFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  return publicKey ? (
    <div>
      <AppHero title="" subtitle="Reviews">
        <p className="mb-6">
          Program ID:
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        {serviceRegistryPubKey && (
          <p className="mb-6">
            Service Registry: {ellipsify(serviceRegistryPubKey.toString())}
          </p>
        )}
      </AppHero>

      <Reviews />
    </div>
  ) : (
    <WalletButton />
  );
}

function Reviews() {
  const { data: reviews, isLoading, error } = useReviewsV1();

  if (isLoading) {
    return <div>Loading reviews...</div>;
  }

  if (error) {
    return <div>Error loading reviews: {error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Reviews on Chain</h2>
      <div className="space-y-4">
        {!reviews?.length ? (
          <div>No reviews found on chain</div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.publicKey.toString()}
              className="p-4 border rounded-lg space-y-2"
            >
              <div>
                <span className="font-semibold">Review ID:</span>{' '}
                {review.account.reviewId}
              </div>
              <div>
                <span className="font-semibold">Customer:</span>{' '}
                {review.account.customer.toString()}
              </div>
              <div>
                <span className="font-semibold">Provider:</span>{' '}
                {review.account.serviceProvider.toString()}
              </div>
              <div>
                <span className="font-semibold">
                  Customer → Provider Rating:
                </span>{' '}
                {review.account.customerToProviderRating || 'Not rated yet'}
              </div>
              <div>
                <span className="font-semibold">
                  Provider → Customer Rating:
                </span>{' '}
                {review.account.providerToCustomerRating || 'Not rated yet'}
              </div>
              <div>
                <span className="font-semibold">Customer Review:</span>{' '}
                {review.account.customerToProviderReview || 'No review yet'}
              </div>
              <div>
                <span className="font-semibold">Provider Review:</span>{' '}
                {review.account.providerToCustomerReview || 'No review yet'}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
