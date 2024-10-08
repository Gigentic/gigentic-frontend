'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Label,
  Textarea,
} from '@gigentic-frontend/ui-kit/ui';

export interface ReviewFormProps {
  contractId: string;
  serviceName: string;
  amount: string;
  provider: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onReleaseEscrow: (contractId: string) => void;
}

export default function ReviewPopup({
  contractId = 'xxasdf',
  serviceName = 'Unnamed Service',
  amount = '0',
  provider = 'Unknown Provider',
  onReleaseEscrow,
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Release Escrow and Review</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contract Escrow Released!</DialogTitle>
          <DialogDescription>
            Now you can rate and share your experience with the service provider
            attached to this contract!
          </DialogDescription>
        </DialogHeader>
        <ReviewForm
          contractId={contractId}
          serviceName={serviceName}
          amount={amount}
          provider={provider}
          setIsOpen={setIsOpen}
          onReleaseEscrow={onReleaseEscrow}
        />
      </DialogContent>
    </Dialog>
  );
}

function ReviewForm({
  contractId,
  serviceName,
  amount,
  provider,
  setIsOpen,
  onReleaseEscrow,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitted review:', { rating, review });
    setRating(0);
    setReview('');
    setIsOpen(false);
    // Call the onReleaseEscrow function passed from the parent component
    onReleaseEscrow(contractId);

    // Here you would typically send the review data to your backend
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-l font-bold">
          Released Contract Infos:
        </CardTitle>
        <CardDescription className="space-y-0.5">
          {/* Deploy your new project in one-click. */}
        </CardDescription>
        <div className="flex flex-col">
          <p>Contract ID: {contractId}</p>
          <p>Service: {serviceName}</p>
          <p>Amount: {amount}</p>
          <p>Provider: {provider}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <CardTitle className="text-xl">Leave a Review</CardTitle>
            <CardDescription>
              Share your experience with the service provider
            </CardDescription>
          </div>
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
              placeholder="Write your review here"
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

{
  /* <form onSubmit={handleReviewSubmit} className="space-y-4">
<div>
  <Label htmlFor="rating">Rating</Label>
  <div className="flex space-x-1 mt-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-6 h-6 cursor-pointer ${star <= rating ? 'fill-primary text-primary' : 'fill-muted text-muted-foreground'}`}
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
    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setReview(e.target.value)
    }
    className="mt-1"
    required
  />
</div>
<Button type="submit" className="w-full">
  Submit Review
</Button>
</form> */
}
