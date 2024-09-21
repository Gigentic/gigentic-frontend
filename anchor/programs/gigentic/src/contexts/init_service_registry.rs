use anchor_lang::prelude::*;

use crate::states::service_registry::ServiceRegistry;

/// Context for initializing the ServiceRegistry account.
/// This struct defines the accounts required for the initialization instruction.
#[derive(Accounts)]
pub struct InitServiceRegistry<'info> {
    /// The account of the user deploying and paying for the initialization.
    /// Marked as `mut` because it will be charged for rent.
    #[account(mut)]
    pub initializer: Signer<'info>,
    /// The ServiceRegistry account to be initialized.
    /// `account(zero)` means this account should be created and initialized with zeroes.
    /// It ensures the account is new and prevents double initialization.
    #[account(zero)]
    pub service_registry: Account<'info, ServiceRegistry>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitServiceRegistry<'info> {
    pub fn handler(&mut self, fee_account: Pubkey, fee_percentage: u8) -> Result<()> {
        self.service_registry.fee_account = fee_account;
        self.service_registry.fee_percentage = fee_percentage;
        msg!(
            "Service Registry Initialized with fee account: {} and fee percentage: {}",
            fee_account,
            fee_percentage
        );
        Ok(())
    }
}
