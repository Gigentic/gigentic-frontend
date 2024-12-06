'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { useReviews } from '@/hooks/blockchain/use-reviews';
import { ReviewCard } from './review-card';
import { UnreviewedServiceCard } from './unreviewed-service-card';
import { useReleaseEscrow } from '@/hooks/blockchain/use-release-escrow';

export function GivenReviews() {
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

  // Filter for given reviews only
  const givenReviews = reviews.filter((review) => review.role === 'customer');
  const givenUnreviewed = unreviewedServices.filter(
    (service) => service.role === 'customer',
  );

  return (
    <div className="space-y-8">
      {/* Unreviewed Services Section */}
      {givenUnreviewed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {givenUnreviewed.map((service) => (
              <UnreviewedServiceCard
                key={service.id}
                service={service}
                type="given"
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
          {givenReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews given yet
              </CardContent>
            </Card>
          ) : (
            givenReviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="given" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
