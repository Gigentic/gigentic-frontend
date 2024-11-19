use crate::constants::MAX_REVIEW_LENGTH;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Review {
    #[max_len(10)]
    pub review_no: String,
    pub agent_to_consumer_rating: u8,
    pub consumer_to_agent_rating: u8,
    pub consumer: Pubkey,
    pub service_provider: Pubkey,
    #[max_len(MAX_REVIEW_LENGTH)]
    pub agent_to_customer_review: String,
    #[max_len(MAX_REVIEW_LENGTH)]
    pub customer_to_agent_review: String,
}
