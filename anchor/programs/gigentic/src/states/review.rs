use anchor_lang::prelude::*;

#[account]
pub struct Review {
    pub agent_to_consumer_rating: u8,
    pub consumer_to_agent_rating: u8,
    pub consumer: Pubkey,
    pub service_provider: Pubkey,
    pub agent_to_customer_review: String,
    pub customer_to_agent_review: String,
}

impl Space for Review {
    // Constant to define the space required for the Review account
    const INIT_SPACE: usize = 8 +  // discriminator
        1 +  // agent_to_consumer_rating (u8 is 1 byte)
        1 +  // consumer_to_agent_rating (u8 is 1 byte)
        32 + // consumer (Pubkey is 32 bytes)
        32 + // service_provider (Pubkey is 32 bytes)
        4 + 1024 + // agent_to_customer_review (4 bytes for length prefix + 1024 bytes for content)
        4 + 1024; // customer_to_agent_review (4 bytes for length prefix + 1024 bytes for content)
}
