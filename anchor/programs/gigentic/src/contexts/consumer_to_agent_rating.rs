use crate::states::review::Review;
use crate::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReviewCustomerToAgentService<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut, constraint = review.consumer == signer.key())]
    pub review: Account<'info, Review>,
    pub system_program: Program<'info, System>,
}

impl<'info> ReviewCustomerToAgentService<'info> {
    pub fn handler(&mut self, rating: u8, review: String) -> Result<()> {
        require!(rating <= 5, ErrorCode::InvalidRating);
        self.review.consumer_to_agent_rating = rating;
        self.review.customer_to_agent_review = review;
        Ok(())
    }
}
