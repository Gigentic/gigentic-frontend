use crate::states::{
    service_authority::ServiceAuthority, service_registry::ServiceRegistry, Service,
};
use crate::ErrorCode;
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use anchor_spl::token_interface::{Mint, TokenInterface};

#[derive(Accounts)]
#[instruction(_unique_id: String)]
pub struct InitializeService<'info> {
    // The provider who is initializing the service
    #[account(mut)]
    provider: Signer<'info>,

    // The service registry where the service will be registered
    #[account(mut)]
    service_registry: Account<'info, ServiceRegistry>,

    // The service account being initialized
    #[account(
        init,
        space = 8+Service::INIT_SPACE,
        payer = provider,
        seeds = [b"service", _unique_id.as_bytes(), provider.key().as_ref() ],
        bump
    )]
    service: Account<'info, Service>,

    pub service_provider_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = provider,
        space = 8,
        seeds = ["service_authority".as_bytes(), service.key().as_ref()],
        bump
    )]
    service_authority: Account<'info, ServiceAuthority>,

    // The mint account for the token
    #[account(
        mint::token_program = token_program
    )]
    mint: InterfaceAccount<'info, Mint>,

    // The token program interface
    token_program: Interface<'info, TokenInterface>,

    // The system program
    system_program: Program<'info, System>,
}

impl<'info> InitializeService<'info> {
    // Handler function to initialize the service
    pub fn handler(&mut self, _unique_id: String, description: String, price: u64) -> Result<()> {
        // Check that the ServiceRegistry still has space for new services
        require_gt!(
            312499,
            self.service_registry.service_account_addresses.len()
        );

        // Ensure the service is not already initialized
        require!(
            !self
                .service_registry
                .service_account_addresses
                .contains(&self.service.key()),
            ErrorCode::ServiceAlreadyInitialized
        );

        // Add the service to the registry
        self.service_registry // Access the service registry account
            .service_account_addresses // Access the vector of service addresses
            .push(self.service.key()); // Push the public key of the new service account

        // Log the last service address or return an error if none are registered
        if let Some(last_address) = self.service_registry.service_account_addresses.last() {
            msg!("New service added. Last address: {}", last_address);
        } else {
            return err!(ErrorCode::NoServicesRegistered);
        }

        // Initialize the service with the provided details
        self.service.set_inner(Service {
            provider: self.provider.key(),
            mint: self.mint.key(),
            description,
            price,
            reviews: Vec::new(), // Initialize reviews as an empty vector
            service_provider_token_account: self.service_provider_token_account.key(),
        });
        Ok(())
    }
}
