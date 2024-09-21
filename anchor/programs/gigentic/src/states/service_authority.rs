use anchor_lang::prelude::*;

#[account]
pub struct ServiceAuthority {}

impl Space for ServiceAuthority {
    const INIT_SPACE: usize = 8; // discriminator
}
