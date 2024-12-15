'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { Briefcase, User } from 'lucide-react';
import { ReviewCardProps } from '@/types/review';

export function ReviewCard({ review, type }: ReviewCardProps) {
  const isProvider = type === 'received';
  const Icon = isProvider ? Briefcase : User;

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

          <div className="space-y-0.1">
            <p className="text-sm text-muted-foreground">Review ID:</p>
            <p className="font-medium">{review.account.reviewId}</p>
          </div>

          <div>
            <p
              className={`text-sm ${type === 'given' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Customer:
            </p>
            <p
              className={`font-mono text-sm ${type === 'given' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {review.account.customer.toString()}
            </p>
          </div>

          <div>
            <p
              className={`text-sm ${type === 'received' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Provider:
            </p>
            <p
              className={`font-mono text-sm ${type === 'received' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {review.account.serviceProvider.toString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Customer → Provider Rating:
            </p>
            <p className="text-sm">
              {review.account.customerToProviderRating}/5
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Provider → Customer Rating:
            </p>
            <p className="text-sm">
              {review.account.providerToCustomerRating}/5
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
