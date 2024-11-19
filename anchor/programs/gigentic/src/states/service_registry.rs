use crate::constants::MAX_REVIEWS;
use anchor_lang::prelude::*;
/// `ServiceRegistry` is an account that maintains a list of public keys for all registered services.
/// It acts as a central directory for tracking and accessing service accounts within the program.
#[account]
#[derive(InitSpace)]
pub struct ServiceRegistry {
    #[max_len(MAX_REVIEWS)]
    pub service_account_addresses: Vec<Pubkey>,
    pub fee_account: Pubkey,
    pub fee_percentage: u8,
}
