use crate::states::review::Review;
use crate::states::Service;
use crate::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReviewAgentToCustomerService<'info> {
    /// The account of the user deploying and paying for the initialization.
    /// Marked as `mut` because it will be charged for rent.
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub service: Account<'info, Service>,

    #[account(
        mut,
        seeds = [b"review_service", service.key().as_ref()],
        bump,
        realloc = 8+ Review::INIT_SPACE,
        realloc::payer = signer,
        realloc::zero = true,

    )]
    pub review: Account<'info, Review>,

    pub system_program: Program<'info, System>,
}

impl<'info> ReviewAgentToCustomerService<'info> {
    pub fn handler(&mut self, rating: u8, review: String) -> Result<()> {
        require!(
            self.signer.key() == self.review.service_provider,
            ErrorCode::UnauthorizedAccess
        );
        require!(rating <= 5, ErrorCode::InvalidRating);

        self.review.agent_to_consumer_rating = rating;
        self.review.agent_to_customer_review = review;
        Ok(())
    }
}
