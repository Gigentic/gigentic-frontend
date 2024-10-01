'use client';

import { SetStateAction, useState } from 'react';
import { StarIcon } from 'lucide-react';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@gigentic-frontend/ui-kit/ui';

export default function GigenticDemo() {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [currentTab, setCurrentTab] = useState('supplier');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  const providers = [
    { id: 1, name: 'Alice Johnson', skill: 'Web Development', rate: '$50/hr' },
    { id: 2, name: 'Bob Smith', skill: 'Graphic Design', rate: '$40/hr' },
    { id: 3, name: 'Charlie Brown', skill: 'Content Writing', rate: '$30/hr' },
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setCurrentTab('payment');
  };

  const handlePaymentSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setCurrentTab('review');
  };

  const handleReviewSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    alert('Thank you for your review!');
    // Reset the demo
    setSelectedProvider(null);
    setCurrentTab('supplier');
    setPaymentAmount('');
    setReview('');
    setRating(0);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Gigentic Demo</h1>
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supplier">Supplier Selection</TabsTrigger>
          <TabsTrigger value="payment">Payment & Escrow</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>
        <TabsContent value="supplier">
          <Card>
            <CardHeader>
              <CardTitle>Select a Service Provider</CardTitle>
              <CardDescription>
                Choose a freelancer for your task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {provider.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{provider.name}</p>
                        <p className="text-sm text-gray-500">
                          {provider.skill}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{provider.rate}</span>
                      <Button onClick={() => handleProviderSelect(provider)}>
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment & Escrow</CardTitle>
              <CardDescription>
                Secure your transaction with escrow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="provider">Selected Provider</Label>
                    <Input
                      id="provider"
                      value={
                        (selectedProvider as unknown as { name: string })
                          ?.name || ''
                      }
                      disabled
                    />
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      placeholder="Enter amount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4">
                  Submit Payment to Escrow
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
              <CardDescription>
                Share your experience with the service provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReviewSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex space-x-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="review">Review</Label>
                    <Textarea
                      id="review"
                      placeholder="Write your review here"
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="mt-4">
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
