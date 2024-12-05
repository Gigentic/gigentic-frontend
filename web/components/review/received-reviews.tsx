'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import {
  mockReceivedReviews,
  mockUnreviewedServicesReceived,
} from './mock-data';
import { ReviewCard } from './components/review-card';
import { UnreviewedServiceCard } from './components/unreviewed-service-card';

export function ReceivedReviews() {
  const reviews = mockReceivedReviews;
  const unreviewedServices = mockUnreviewedServicesReceived;

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
                No reviews received yet
              </CardContent>
            </Card>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} type="received" />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
