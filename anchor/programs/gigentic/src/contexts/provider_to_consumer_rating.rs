use crate::states::review::Review;
use crate::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReviewProviderToCustomerService<'info> {
    // The account of the user deploying and paying for the initialization.
    // Marked as `mut` because it will be charged for rent.
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut, constraint = review.service_provider == signer.key())]
    pub review: Account<'info, Review>,

    pub system_program: Program<'info, System>,
}

impl<'info> ReviewProviderToCustomerService<'info> {
    pub fn handler(&mut self, rating: u8, review: String) -> Result<()> {
        require!(rating <= 5, ErrorCode::InvalidRating);
        self.review.provider_to_consumer_rating = rating;
        self.review.provider_to_customer_review = review;
        Ok(())
    }
}
