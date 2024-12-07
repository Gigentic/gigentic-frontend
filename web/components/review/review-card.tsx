'use client';

import { Review } from '@/hooks/blockchain/use-reviews';
import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
// import { Review } from './mock-data';
import { Briefcase, User } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  type: 'given' | 'received';
}

export function ReviewCard({ review, type }: ReviewCardProps) {
  const isProvider = review.role === 'provider';
  const Icon = isProvider ? Briefcase : User;
  const colorClass = isProvider ? 'blue' : 'green';

  return (
    <Card
      className={`border-${colorClass}-200/50 hover:border-opacity-100 transition-colors`}
    >
      <CardContent className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Rating:</span>
              <span>
                {'⭐'.repeat(review.account.providerToCustomerRating)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className={`w-4 h-4 text-${colorClass}-500`} />
              <span>{review.account.reviewId}</span>
            </div>
          </div>
          <p className="text-muted-foreground">
            {review.account.customerToProviderReview}
          </p>
          <div className="text-sm flex items-center justify-between">
            <span className={`text-${colorClass}-600`}>
              {type === 'received'
                ? `From ${isProvider ? 'Provider' : 'Customer'}`
                : `As ${isProvider ? 'Provider' : 'Customer'}`}
            </span>
            <span className="text-muted-foreground">
              {type === 'given' ? 'To:' : 'From:'}{' '}
              {review.account.customer.toBase58()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
