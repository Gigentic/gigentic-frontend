use crate::states::review::Review;
use crate::states::Service;
use crate::ErrorCode;
use anchor_lang::prelude::*;
#[derive(Accounts)]
pub struct ReviewCustomerToAgentService<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub service: Account<'info, Service>,
    #[account(
        mut,
        seeds = [b"review_service", service.key().as_ref()],
        bump,
    )]
    pub review: Account<'info, Review>,
    pub system_program: Program<'info, System>,
}
impl<'info> ReviewCustomerToAgentService<'info> {
    pub fn handler(&mut self, rating: u8, review: String) -> Result<()> {
        require!(
            self.signer.key() == self.review.consumer,
            ErrorCode::UnauthorizedAccess
        );
        require!(rating <= 5, ErrorCode::InvalidRating);
        self.review.consumer_to_agent_rating = rating;
        self.review.customer_to_agent_review = review;
        Ok(())
    }
}
