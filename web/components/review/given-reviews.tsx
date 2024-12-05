'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { mockGivenReviews, mockUnreviewedServicesGiven } from './mock-data';
import { ReviewCard } from './components/review-card';
import { UnreviewedServiceCard } from './components/unreviewed-service-card';

export function GivenReviews() {
  const reviews = mockGivenReviews;
  const unreviewedServices = mockUnreviewedServicesGiven;

  return (
    <div className="space-y-8">
      {/* Unreviewed Services Section */}
      {unreviewedServices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {unreviewedServices.map((service) => (
              <UnreviewedServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      )}

      {/* Review History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Review History</h2>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews given yet
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="given" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
