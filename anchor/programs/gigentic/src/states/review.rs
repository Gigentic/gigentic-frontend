use crate::constants::MAX_REVIEW_LENGTH;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Review {
    #[max_len(10)]
    pub review_id: String,
    pub provider_to_customer_rating: u8,
    pub customer_to_provider_rating: u8,
    pub customer: Pubkey,
    pub service_provider: Pubkey,
    #[max_len(MAX_REVIEW_LENGTH)]
    pub provider_to_customer_review: String,
    #[max_len(MAX_REVIEW_LENGTH)]
    pub customer_to_provider_review: String,
}
