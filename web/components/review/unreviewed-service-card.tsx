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
      role: review.role,
      serviceAccount: review.serviceAccount,
    });
  };

  const Icon = review.role === 'provider' ? Briefcase : User;

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-4">
            <Icon className="h-6 w-6 text-primary" />
            <div>
              <h3 className="font-medium">{review.serviceTitle}</h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.1">
              <p className="text-sm text-muted-foreground">Review ID:</p>
              <p className="font-medium">{review.account.reviewId}</p>
            </div>
            <ReviewPopupDialog
              serviceTitle={review.serviceTitle}
              providerName={review.account.serviceProvider.toString()}
              amount="0.1" // TODO: Add actual amount from the service
              onSubmit={handleFormSubmit}
            />
          </div>

          <div>
            <p
              className={`text-sm ${
                review.role === 'customer'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Customer:
            </p>
            <p
              className={`font-mono text-sm ${
                review.role === 'customer'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {review.account.customer.toString()}
            </p>
          </div>

          <div>
            <p
              className={`text-sm ${
                review.role === 'provider'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Provider:
            </p>
            <p
              className={`font-mono text-sm ${
                review.role === 'provider'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {review.account.serviceProvider.toString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Customer → Provider Rating:
            </p>
            <p className="text-sm">
              {review.account.customerToProviderRating || 'Not rated yet'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Provider → Customer Rating:
            </p>
            <p className="text-sm">
              {review.account.providerToCustomerRating || 'Not rated yet'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Customer Review:</p>
            <p className="text-sm">
              {review.account.customerToProviderReview || 'No review yet'}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Provider Review:</p>
            <p className="text-sm">
              {review.account.providerToCustomerReview || 'No review yet'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
