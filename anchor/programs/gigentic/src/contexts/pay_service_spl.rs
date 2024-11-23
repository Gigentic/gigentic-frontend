use crate::states::review::Review;
use crate::states::service_registry::ServiceRegistry;
use crate::states::{Escrow, Service};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

/// Accounts required for the `PayServiceSPl` instruction.
#[derive(Accounts)]
#[instruction(review_id: String)]
pub struct PayServiceSpl<'info> {
    /// The customer who will sign the transaction.
    #[account(mut)]
    pub customer: Signer<'info>,

    /// The service account.
    #[account(mut)]
    pub service: Box<Account<'info, Service>>,

    /// The service registry account.
    #[account(mut)]
    service_registry: Box<Account<'info, ServiceRegistry>>,

    /// The escrow account, initialized with a specific space and seeds.
    #[account(
        init,
        payer = customer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", service.key().as_ref(), service.provider.key().as_ref(), customer.key().as_ref()],
        bump
    )]
    pub escrow: Box<Account<'info, Escrow>>,

    #[account(mut)]
    pub customer_token_account: Box<Account<'info, TokenAccount>>,

    /// The mint account.
    pub mint: Account<'info, Mint>,

    /// The token account for the escrow, initialized with the mint and authority.
    #[account(
        init,
        payer = customer,
        token::mint = mint,
        token::authority = escrow_token_account,
        seeds = [b"escrow-token-account", escrow.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = customer,
        space = 8 + Review::INIT_SPACE,
        seeds = [b"review", review_id.as_bytes(), service.key().as_ref()],
        bump,
    )]
    pub review: Account<'info, Review>, // Moved to heap

    /// The token program.
    pub token_program: Program<'info, Token>,

    /// The rent sysvar.
    pub rent: Sysvar<'info, Rent>,

    /// The system program.
    pub system_program: Program<'info, System>,
}
impl<'info> PayServiceSpl<'info> {
    pub fn handler(&mut self, review_id: String) -> Result<()> {
        // Setting up escrow details
        self.escrow.customer = self.customer.key();
        self.escrow.service_provider = self.service.provider;
        self.escrow.fee_percentage = self.service_registry.fee_percentage;
        self.escrow.expected_amount = self.service.price;
        self.escrow.fee_account = self.service_registry.fee_account;
        self.escrow.service_provider_token_account =
            Some(self.service.service_provider_token_account);
        self.escrow.fee_token_account = Some(self.escrow_token_account.key());
        self.escrow.escrow_token_account = Some(self.escrow_token_account.key());

        // Sets the review details
        self.review.set_inner(Review {
            review_id,
            provider_to_customer_rating: 0,
            customer_to_provider_rating: 0,
            customer: self.customer.key(),
            service_provider: self.service.provider.key(),
            provider_to_customer_review: String::from(""),
            customer_to_provider_review: String::from(""),
        });

        self.service.reviews.push(self.review.key());

        // Transfers spl tokens
        self.transfer_spl_tokens(self.service.price)?;

        Ok(())
    }
    fn transfer_spl_tokens(&self, amount: u64) -> Result<()> {
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: self.customer_token_account.to_account_info(),
                    to: self.escrow_token_account.to_account_info(),
                    authority: self.customer.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }
}
