'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Textarea,
} from '@gigentic-frontend/ui-kit/ui';

import { ReviewFormProps } from '@/types/review';

export function ReviewPopupDialog({
  serviceTitle,
  providerName,
  amount,
  onSubmit,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, reviewText });
      setIsOpen(false);
      // Reset form
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('Failed to submit review:', error);
      // TODO: Show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Submit Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">Review Service</DialogTitle>
          <DialogDescription>
            Rate and review your experience with this service
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{serviceTitle}</CardTitle>
            <Label>{providerName.slice(0, 4)}...</Label>
            <CardDescription>Amount: {amount} SOL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating:</Label>
              <div className="flex space-x-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 cursor-pointer transition-colors
                      ${star <= rating ? 'fill-primary text-primary' : 'text-muted-foreground'}
                      hover:text-primary hover:fill-background dark:hover:text-muted dark:hover:fill-muted`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Label htmlFor="review">Review:</Label>
              <Textarea
                className="mt-1"
                id="review"
                placeholder="Write your review here"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={rating === 0 || reviewText === '' || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// stars implemented with Button
{
  /* <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <Button
            key={value}
            variant="ghost"
            size="sm"
            className={
              value <= rating
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }
            onClick={() => setRating(value)}
          >
            <Star className="h-6 w-6" />
          </Button>
        ))}
      </div> */
}
