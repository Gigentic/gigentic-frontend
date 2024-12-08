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
  Label,
  Textarea,
  DialogFooter,
} from '@gigentic-frontend/ui-kit/ui';

import { ReviewFormProps } from '@/types/review';

export function ReviewPopup({
  serviceTitle,
  providerName,
  amount,
  onSubmit,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, review });
      setIsOpen(false);
      // Reset form
      setRating(0);
      setReview('');
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Service</DialogTitle>
          <DialogDescription>
            Rate and review your experience with this service
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">{serviceTitle}</p>
            <p className="text-sm text-muted-foreground">
              Provider: {providerName}
              <br />
              Amount: {amount} SOL
            </p>
          </div>
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  className={
                    value <= rating
                      ? 'text-yellow-500'
                      : 'text-muted-foreground'
                  }
                  onClick={() => setRating(value)}
                >
                  <Star className="h-5 w-5" />
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="review">Review</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Write your review..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
