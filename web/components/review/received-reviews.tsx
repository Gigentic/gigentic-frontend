'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { ReviewTabProps } from '@/types/review';
import { ReviewCard } from './review-card';
import { UnreviewedServiceCard } from './unreviewed-service-card';

export function ReceivedReviews({
  completedReviews,
  pendingReviews,
}: ReviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Provider Reviews to Submit Section */}
      {pendingReviews.filter(
        (review) =>
          review.role === 'provider' &&
          !review.account.providerToCustomerRating,
      ).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviews to Submit</h2>
          <div className="space-y-4">
            {pendingReviews
              .filter(
                (review) =>
                  review.role === 'provider' &&
                  !review.account.providerToCustomerRating,
              )
              .map((review) => (
                <UnreviewedServiceCard
                  key={review.publicKey.toString()}
                  review={review}
                  type="received"
                />
              ))}
          </div>
        </div>
      )}

      {/* Customer Reviews to Submit Section - THIS SHOULD BE EMPTY 
      {pendingReviews.filter(
        (review) =>
          review.role === 'customer' &&
          !review.account.customerToProviderRating,
      ).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Reviews to Submit</h2>
          <div className="space-y-4">
            {pendingReviews
              .filter(
                (review) =>
                  review.role === 'customer' &&
                  !review.account.customerToProviderRating,
              )
              .map((review) => (
                <UnreviewedServiceCard
                  key={review.publicKey.toString()}
                  review={review}
                  type="received"
                />
              ))}
          </div>
        </div>
      )}*/}

      {/* Completed Reviews Section */}
      {pendingReviews.filter(
        (review) =>
          (review.role === 'provider' &&
            review.account.providerToCustomerRating > 0) ||
          (review.role === 'customer' &&
            review.account.customerToProviderRating > 0),
      ).length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Review History</h2>
          <div className="space-y-4">
            {pendingReviews
              .filter(
                (review) =>
                  (review.role === 'provider' &&
                    review.account.providerToCustomerRating > 0) ||
                  (review.role === 'customer' &&
                    review.account.customerToProviderRating > 0),
              )
              .map((review) => (
                <ReviewCard
                  key={review.publicKey.toString()}
                  review={review}
                  type="received"
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
