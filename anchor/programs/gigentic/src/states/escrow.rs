use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub customer: Pubkey, // the customer who will pay the money to the escrow
    pub service_provider: Pubkey, // the service provider who will receive the money from the escrow
    pub fee_percentage: u8, // the fee percentage that the service provider will pay to the registry
    pub expected_amount: u64, // the expected amount for the service
    pub fee_account: Pubkey, // the fee account that will receive the fee from the service provider
}
