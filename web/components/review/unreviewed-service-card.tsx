'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { ReviewPopupDialog } from './review-popup-dialog';
import { ReviewCardProps, ReviewFormData } from '@/types/review';
import { Briefcase, User } from 'lucide-react';
import { useReviewSubmission } from '@/hooks/blockchain/use-review-submission';

export function UnreviewedServiceCard({ review, type }: ReviewCardProps) {
  const { submitReview } = useReviewSubmission();

  const handleFormSubmit = async (formData: ReviewFormData) => {
    await submitReview({
      ...formData,
      reviewId: review.account.reviewId,
      role: type === 'given' ? 'customer' : 'provider',
    });
  };

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
                {type === 'given' ? 'Service Provider' : 'Customer'}:
              </p>
              <p className="font-medium">
                {type === 'given'
                  ? review.account.serviceProvider.toString()
                  : review.account.customer.toString()}
              </p>
            </div>
          </div>
          <ReviewPopupDialog
            serviceTitle={review.serviceTitle}
            providerName={review.account.serviceProvider.toString()}
            amount="0.1" // TODO: Add actual amount from the service
            onSubmit={handleFormSubmit}
          />
        </div>
      </CardContent>
    </Card>
  );
}
