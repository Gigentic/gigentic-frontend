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
      {/* Pending Reviews Section */}
      {pendingReviews.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-4">
            {pendingReviews.map((review) => (
              <UnreviewedServiceCard
                key={review.publicKey.toString()}
                review={review}
                type="received"
              />
            ))}
          </div>
        </div>
      )}

      {/* Review History Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Review History</h2>
        <div className="space-y-4">
          {completedReviews.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No reviews received yet
              </CardContent>
            </Card>
          ) : (
            completedReviews.map((review) => (
              <ReviewCard
                key={review.publicKey.toString()}
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
