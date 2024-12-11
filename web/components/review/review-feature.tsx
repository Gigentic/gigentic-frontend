'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
} from '@gigentic-frontend/ui-kit/ui';
import { Loader2 } from 'lucide-react';

import { useReviewsFromMock, useReviews } from '@/hooks/blockchain/use-reviews';
import { ReceivedReviews } from './received-reviews';
import { GivenReviews } from './given-reviews';

export default function ReviewFeature() {
  const { data, isLoading, error } = useReviews();

  if (isLoading) {
    return (
      <div className="h-[50vh] flex items-center justify-center w-full max-w-3xl mx-auto">
        <Card className="bg-background">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            <p className="mt-2">Loading reviews...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[50vh] flex items-center justify-center w-full max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Error loading reviews: {error.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.completed || !data?.pending) return null;

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          {/* <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-lg">
            Manage and view your reviews
          </p> */}
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">As a Customer</TabsTrigger>
            <TabsTrigger value="given">As a Provider</TabsTrigger>
          </TabsList>
          <TabsContent value="received" className="mt-6">
            <ReceivedReviews
              completedReviews={data.completed.received}
              pendingReviews={data.pending.toReceive}
            />
          </TabsContent>
          <TabsContent value="given" className="mt-6">
            <GivenReviews
              completedReviews={data.completed.given}
              pendingReviews={data.pending.toGive}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
