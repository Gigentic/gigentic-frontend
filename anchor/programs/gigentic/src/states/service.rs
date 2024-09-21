use crate::constants::MAX_DESCRIPTION_LENGTH;
use anchor_lang::prelude::*;

#[account]
pub struct Service {
    pub provider: Pubkey,
    pub mint: Pubkey,
    pub description: String,
    pub price: u64,
    pub reviews: Vec<Pubkey>,
}

impl Space for Service {
    const INIT_SPACE: usize = 8 + // discriminator
        32 + // provider
        32 + // mint
        4 + MAX_DESCRIPTION_LENGTH + // description (with max length)
        8 + // price
        4 + (32 * 10); // reviews (assuming a maximum of 10 reviews)
}
