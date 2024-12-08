'use client';

import { useGigenticProgram } from './use-gigentic-program';
import { ReviewSubmitData } from '@/types/review';

export function useReviewSubmission() {
  const program = useGigenticProgram();

  const submitReview = async (data: ReviewSubmitData) => {
    if (!program) {
      throw new Error('Program not initialized');
    }

    try {
      // mock blockchain delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log('Review submitted:', data);

      // TODO: Replace with actual program method once contract is ready
      // const tx = await program.methods
      //   .submitReview({
      //     reviewId: data.reviewId,
      //     rating: data.rating,
      //     review: data.review,
      //     role: data.role,
      //   })
      //   .rpc();
      // return tx;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  return { submitReview };
}
