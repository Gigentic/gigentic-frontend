use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub buyer: Pubkey,            // what this escrow is for
    pub service_provider: Pubkey, // the service provider for who is money getting transferred to
    pub fee_percentage: u8,       // The fee%
    pub expected_amount: u64,
    pub fee_account: Pubkey,
}

impl Space for Escrow {
    const INIT_SPACE: usize = 8 + // discriminator
    32 + // buyer
    32 + // service_provider
    1 +  // fee_percentage (u8 is 1 byte)
    8 +  // expected_amount
    32; // fee_account
}
