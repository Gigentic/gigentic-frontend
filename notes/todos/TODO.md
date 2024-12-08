Current state and progress:

### Completed Features

1. **Component Structure**

- ✓ Main ReviewFeature with proper loading/error states
- ✓ Tab-based navigation between given/received reviews
- ✓ Reusable ReviewCard and UnreviewedServiceCard components
- ✓ ReviewPopup with rating UI

2. **Data Flow**

- ✓ Clear data transformation from chain to UI format
- ✓ Proper categorization of reviews (completed/pending)
- ✓ Role-based filtering (given/received)

3. **UI/UX**

- ✓ Consistent styling across components
- ✓ Empty states for no reviews
- ✓ Icons indicating provider/customer roles
- ✓ Star rating system

### Current Implementation Status

1. **Review Submission**

- Partially done: UI and data structure ready
- Missing: Actual blockchain submission
  Reference:

```21:24:web/components/review/review-feature.tsx
  const handleReviewSubmit = async (reviewData: ReviewSubmitData) => {
    // TODO: Implement review submission
    console.log('Submitting review:', reviewData);
  };
```

2. **Form Validation**

- Basic validation: Required fields
- Missing: Rating validation, review text length
  Reference:

```94:118:web/components/review/review-popup.tsx
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
```

3. **Error Handling**

- Basic error states for data fetching
- Missing: Submission error handling
  Reference:

```39:49:web/components/review/review-feature.tsx
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
```

### Still To Implement (Prioritized)

1. **Critical Features**

- Review submission to blockchain
- Form validation (rating required, minimum review length)
- Error handling for submission

2. **Data Management**

- Query caching configuration
- Retry logic for failed fetches
- Real-time updates

3. **UX Improvements**

- Loading state during submission
- Error states in ReviewPopup
- Retry mechanism for failed submissions

4. **Testing Suite**

- Unit tests for components
- Integration tests
- Mock tests for blockchain

5. **Performance**

- Pagination for large datasets
- Optimistic updates

---

Let's continue with implementing the actual review submission to the blockchain.

## Analyze the current implementation:

1. **HandleReviewSubmit Location**
   The handler is defined in ReviewFeature (`review-feature.tsx`, lines 22-25) because:

- It needs access to the blockchain connection/program
- It manages the global review state
- It's passed down to both GivenReviews and ReceivedReviews components

However, this creates a long prop chain:

```
ReviewFeature -> ReviewTabs -> UnreviewedServiceCard -> ReviewPopup -> ReviewForm
```

2. **Interface Redundancy**
   Looking at the interfaces:

```35:40:web/lib/types/review.ts
export interface ReviewSubmitData {
  reviewId: string;
  rating: number;
  review: string;
  role: 'customer' | 'provider';
}
```

ReviewSubmitData has: `reviewId`, `rating`, `review`, `role`

```57:63:web/lib/types/review.ts
export interface ReviewFormProps {
  escrowId: string;
  serviceTitle: string;
  providerName: string;
  amount: string;
  onSubmitReview: (escrowId: string, rating: number, review: string) => void;
}
```

ReviewFormProps has: `escrowId`, `serviceTitle`, `providerName`, `amount`, `onSubmitReview`

The issue is:

- ReviewSubmitData is blockchain-oriented
- ReviewFormProps is UI-oriented
- They handle the same concept but at different layers

## Now please implement the following:

1. **Move Submission Logic to a Custom Hook**

```typescript
export function useReviewSubmission() {
  const program = useGigenticProgram();

  const submitReview = async (data: ReviewSubmitData) => {
    // Blockchain submission logic
    await program.methods.submitReview({
      reviewId: data.reviewId,
      rating: data.rating,
      review: data.review,
      role: data.role,
    });
  };

  return { submitReview };
}
```

2. **Simplify the Interfaces**

```typescript
// UI Layer
interface ReviewFormData {
  rating: number;
  review: string;
}

interface ReviewFormProps {
  serviceTitle: string;
  providerName: string;
  amount: string;
  onSubmit: (data: ReviewFormData) => void;
}

// Data Layer
interface ReviewSubmitData extends ReviewFormData {
  reviewId: string;
  role: 'customer' | 'provider';
}
```

3. **Component Restructuring**

```typescript
// UnreviewedServiceCard.tsx
export function UnreviewedServiceCard({ review, type }: UnreviewedServiceCardProps) {
  const { submitReview } = useReviewSubmission();

  const handleSubmit = async (formData: ReviewFormData) => {
    await submitReview({
      ...formData,
      reviewId: review.account.reviewId,
      role: type === 'given' ? 'customer' : 'provider'
    });
  };

  return (
    <ReviewPopup
      serviceTitle={review.serviceTitle}
      providerName={review.account.serviceProvider.toString()}
      amount="0.1"
      onSubmit={handleSubmit}
    />
  );
}
```

Benefits:

1. Submission logic lives closer to where it's used
2. Clear separation between UI and data layers
3. Simpler prop drilling
4. Reusable submission hook
5. Each component handles its own concerns

Implement the changes and let's see if it works. Think step by step, identify the parts that need to be changed and let's discuss the changes.
