use crate::constants::{MAX_DESCRIPTION_LENGTH, MAX_REVIEWS};
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Service {
    pub provider: Pubkey,
    pub mint: Pubkey,
    #[max_len(MAX_DESCRIPTION_LENGTH)]
    pub description: String,
    pub price: u64,
    #[max_len(MAX_REVIEWS)]
    pub reviews: Vec<Pubkey>,
    pub service_provider_token_account: Pubkey,
}

