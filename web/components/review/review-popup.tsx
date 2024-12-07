'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Label,
  Textarea,
} from '@gigentic-frontend/ui-kit/ui';
import { ReviewFormProps } from '@/types/review';

export default function ReviewPopup({
  escrowId,
  serviceTitle,
  providerName,
  amount,
  onSubmitReview,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Submit Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Leave a Review!</DialogTitle>
          <DialogDescription>
            Rate and review your experience with this service
          </DialogDescription>
        </DialogHeader>
        <ReviewForm
          escrowId={escrowId}
          serviceTitle={serviceTitle}
          providerName={providerName}
          amount={amount}
          onSubmit={(rating, review) => {
            onSubmitReview(escrowId, rating, review);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({
  escrowId,
  serviceTitle,
  providerName,
  amount,
  onSubmit,
}: Omit<ReviewFormProps, 'onSubmitReview'> & {
  onSubmit: (rating: number, review: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(rating, review);
    setRating(0);
    setReview('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-xl">Service: {serviceTitle}</CardTitle>
        <CardDescription className="space-y-0.5">
          Amount: {amount} SOL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="rating">Rating</Label>
            <div className="flex space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              placeholder="Share your experience with the service provider"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="mt-1"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-center">
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
