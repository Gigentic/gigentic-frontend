use crate::states::service_registry::ServiceRegistry;
use crate::states::{Escrow, Service};
use crate::states::review::Review;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

/// Accounts required for the `PayServiceSPl` instruction.
#[derive(Accounts)]
#[instruction(review_no: String)]
pub struct PayServiceSpl<'info> {
    /// The buyer who will sign the transaction.
    #[account(mut)]
    pub buyer: Signer<'info>,

    /// The service account.
    #[account(mut)]
    pub service: Box<Account<'info, Service>>, // Moved to heap

    /// The service registry account.
    #[account(mut)]
    pub service_registry: Box<Account<'info, ServiceRegistry>>, // Moved to heap

    /// The escrow account, initialized with a specific space and seeds.
    #[account(
        init,
        payer = buyer,
        space = 8 + Escrow::INIT_SPACE,
        seeds = [b"escrow", service.key().as_ref(), service.provider.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub escrow: Box<Account<'info, Escrow>>, // Moved to heap

    /// The source token account from which tokens will be transferred.
    #[account(
        mut,
        constraint = buyer_token_account.mint == service.mint.key(),
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// The review account.
    #[account(
        init,
        payer = buyer,
        space = 8 + Review::INIT_SPACE,
        seeds = [b"review_service", review_no.as_bytes(), service.key().as_ref()],
        bump,
    )]
    pub review: Box<Account<'info, Review>>, // Moved to heap

    /// The mint account.
    #[account(
        constraint = mint.key() == service.mint.key()
    )]
    pub mint: Account<'info, Mint>,

    /// Token account for escrow (only for SPL tokens)
    #[account(
        init_if_needed,
        payer = buyer,
        token::mint = mint,
        token::authority = escrow,
        seeds = [b"escrow-token-account", escrow.key().as_ref()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    /// The token program.
    pub token_program: Program<'info, Token>,

    /// The rent sysvar.
    pub rent: Sysvar<'info, Rent>,

    /// The system program.
    pub system_program: Program<'info, System>,
}

impl<'info> PayServiceSpl<'info> {
    /// Handler for the `PayService` instruction.
    pub fn handler(&mut self,review_no:String) -> Result<()> {
        // Get the service price.
        let service_price = self.service.price;

        // Set the escrow details.
        self.set_escrow_details(service_price);

        // Transfer SPL tokens from the source to the escrow token account.

         self.review.set_inner(Review {
            review_no,
            agent_to_consumer_rating: 0,
            consumer_to_agent_rating: 0,
            consumer: self.buyer.key(),
            service_provider: self.service.provider.key(),
            agent_to_customer_review: String::from(""),
            customer_to_agent_review: String::from(""),
        });

        self.transfer_spl_tokens(service_price)?;


        Ok(())
    }

    /// Transfer SPL tokens from the buyer's token account to the escrow token account.
    fn transfer_spl_tokens(&self, amount: u64) -> Result<()> {
        let buyer_token_account = &self.buyer_token_account;
        let escrow_token_account = &self.escrow_token_account;
        token::transfer(
            CpiContext::new(
                self.token_program.to_account_info(),
                Transfer {
                    from: buyer_token_account.to_account_info(),
                    to: escrow_token_account.to_account_info(),
                    authority: self.buyer.to_account_info(),
                },
            ),
            amount,
        )?;
        Ok(())
    }

    /// Set the details of the escrow account.
    fn set_escrow_details(&mut self, amount: u64) {
        self.escrow.buyer = self.buyer.key();
        self.escrow.service_provider = self.service.provider;
        self.escrow.fee_percentage = self.service_registry.fee_percentage;
        self.escrow.expected_amount = amount;
        self.escrow.fee_account = self.service_registry.fee_account;
        self.escrow.service_provider_token_account = Some(self.service.service_provider_token_account);
        self.escrow.fee_token_account = Some(self.escrow_token_account.key());
        self.escrow.escrow_token_account = Some(self.escrow_token_account.key());
    }
}
