use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub buyer: Pubkey,            // what this escrow is for
    pub service_provider: Pubkey, // the service provider for who is money getting transferred to
    pub fee_percentage: u8,       // The fee%
    pub expected_amount: u64,
    pub fee_account: Pubkey,
}

