'use client';

import { Card, CardContent } from '@gigentic-frontend/ui-kit/ui';
import { Briefcase, User } from 'lucide-react';
import { Review } from '@/types/review';

interface ReviewCardProps {
  review: Review;
  type: 'given' | 'received';
}

export function ReviewCard({ review, type }: ReviewCardProps) {
  const isProvider = type === 'received';
  const Icon = isProvider ? Briefcase : User;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <div className="space-y-1">
            <h3 className="font-medium">{review.serviceTitle}</h3>
            <div className="text-sm text-muted-foreground">
              {type === 'given' ? (
                <>
                  <p>
                    Your rating: {review.account.customerToProviderRating}/5
                  </p>
                  <p>
                    Provider rating: {review.account.providerToCustomerRating}/5
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Customer rating: {review.account.customerToProviderRating}/5
                  </p>
                  <p>
                    Your rating: {review.account.providerToCustomerRating}/5
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
