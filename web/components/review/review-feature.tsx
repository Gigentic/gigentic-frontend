'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@gigentic-frontend/ui-kit/ui';
import { GivenReviews } from './given-reviews';
import { ReceivedReviews } from './received-reviews';

export default function ReviewFeature() {
  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
          <p className="text-muted-foreground text-lg">
            Manage and view your service reviews
          </p>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Reviews Received</TabsTrigger>
            <TabsTrigger value="given">Reviews Given</TabsTrigger>
          </TabsList>
          <TabsContent value="received" className="mt-6">
            <ReceivedReviews />
          </TabsContent>
          <TabsContent value="given" className="mt-6">
            <GivenReviews />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
