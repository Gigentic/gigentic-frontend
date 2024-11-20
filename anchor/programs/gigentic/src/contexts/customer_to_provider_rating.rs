use crate::states::review::Review;
use crate::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReviewCustomerToProviderService<'info> {
    // The account of the user deploying and paying for the initialization.
    // Marked as `mut` because it will be charged for rent.
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, constraint = review.customer == signer.key())]
    pub review: Account<'info, Review>,

    pub system_program: Program<'info, System>,
}

impl<'info> ReviewCustomerToProviderService<'info> {
    pub fn handler(&mut self, rating: u8, review: String) -> Result<()> {
        require!(rating <= 5, ErrorCode::InvalidRating);
        self.review.customer_to_provider_rating = rating;
        self.review.customer_to_provider_review = review;
        Ok(())
    }
}
