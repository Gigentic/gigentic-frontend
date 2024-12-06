'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { useReviews } from '@/hooks/blockchain/use-reviews';
import { ReviewCard } from './review-card';
import { UnreviewedServiceCard } from './unreviewed-service-card';
import { useReleaseEscrow } from '@/hooks/blockchain/use-release-escrow';

export function ReceivedReviews() {
  const { data, isLoading, error } = useReviews();
  const { handleReleaseEscrow } = useReleaseEscrow();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading reviews...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Error loading reviews: {error.message}
        </CardContent>
      </Card>
    );
  }

  const { reviews, unreviewedServices } = data || {
    reviews: [],
    unreviewedServices: [],
  };

  // Filter for received reviews only
  const receivedReviews = reviews.filter(
    (review) => review && review.role === 'provider',
  );
  const receivedUnreviewed = unreviewedServices.filter(
    (service) => service && service.role === 'provider',
  );

  return (
    <div className="space-y-8">
      {/* Unreviewed Services Section */}
      {receivedUnreviewed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {receivedUnreviewed.map((service) => (
              <UnreviewedServiceCard
                key={service.id}
                service={service}
                type="received"
                onReview={(rating, review) =>
                  handleReleaseEscrow(
                    service.id,
                    service.serviceProvider,
                    rating,
                    review,
                  )
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* Review History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Review History</h2>
        <div className="space-y-4">
          {receivedReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews received yet
              </CardContent>
            </Card>
          ) : (
            receivedReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="received" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
