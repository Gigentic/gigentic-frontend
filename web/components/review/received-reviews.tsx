'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { useReviewsFromMock } from '@/hooks/blockchain/use-reviews-mock';
import { ReviewCard } from './review-card';
// import { UnreviewedServiceCard } from './unreviewed-service-card';

export function ReceivedReviews() {
  const { data, isLoading, error } = useReviewsFromMock();

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

  // const { reviews, unreviewedServices } = data || {
  //   reviews: [],
  //   unreviewedServices: [],
  // };

  // // Filter for received reviews only
  // const receivedReviews = reviews.filter(
  //   (review) => review && review.role === 'provider',
  // );
  // const receivedUnreviewed = unreviewedServices.filter(
  //   (service) => service && service.role === 'provider',
  // );

  return (
    <div className="space-y-8">
      {/* Unreviewed Services Section */}
      {/* {receivedUnreviewed.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {receivedUnreviewed.map((service) => (
              <UnreviewedServiceCard
                key={service.id}
                service={service}
                type="received"
                onReview={(rating, review) => {}}
              />
            ))}
          </div>
        </div>
      )} */}

      {/* Review History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Review History</h2>
        <div className="space-y-4">
          {data?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews received yet
              </CardContent>
            </Card>
          ) : (
            data?.map((review) => (
              <ReviewCard
                key={review.account.reviewId}
                review={review}
                type="received"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
