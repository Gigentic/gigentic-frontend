'use client';

import { useState } from 'react';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { Briefcase, User } from 'lucide-react';
import { Review, ReviewSubmitData } from '@/types/review';
import ReviewPopup from './review-popup';

interface UnreviewedServiceCardProps {
  review: Review;
  type: 'given' | 'received';
  onReviewSubmit: (reviewData: ReviewSubmitData) => Promise<void>;
}

export function UnreviewedServiceCard({
  review,
  type,
  onReviewSubmit,
}: UnreviewedServiceCardProps) {
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const isProvider = type === 'received';
  const Icon = isProvider ? Briefcase : User;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Icon className="h-6 w-6 text-muted-foreground" />
            <div>
              <h3 className="font-medium">{review.serviceTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {type === 'given' ? 'Provider' : 'Customer'}:{' '}
                {type === 'given'
                  ? review.account.serviceProvider.toString()
                  : review.account.customer.toString()}
              </p>
            </div>
          </div>
          <ReviewPopup
            escrowId={review.account.reviewId}
            serviceTitle={review.serviceTitle}
            providerName={review.account.serviceProvider.toString()}
            amount="0.1"
            onSubmitReview={(escrowId, rating, reviewText) => {
              onReviewSubmit({
                reviewId: escrowId,
                rating,
                review: reviewText,
                role: type === 'given' ? 'customer' : 'provider',
              });
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
