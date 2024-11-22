use crate::states::{Escrow, Service};
use crate::ErrorCode;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

/// Accounts required for the `SignService` instruction.
#[derive(Accounts)]
pub struct SignServiceSpl<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,

    pub service: Account<'info, Service>,

    #[account(
        mut,
        close = customer, // Transfer remaining lamports to the buyer when the account is closed
        seeds = [b"escrow", service.key().as_ref(), service.provider.key().as_ref(), customer.key().as_ref()],
        bump,
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK: This account is safe to use.
    #[account(mut)]
    pub service_provider: AccountInfo<'info>,

    #[account(
        mut,
        constraint = fee_token_account.mint == mint.key()
    )]
    pub fee_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub service_provider_token_account: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        seeds = [b"escrow-token-account", escrow.key().as_ref()],
        bump,
    )]
    pub escrow_token_account: Account<'info, TokenAccount>, // The escrow token account

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}

impl<'info> SignServiceSpl<'info> {
    pub fn handler(&mut self, bump: &u8) -> Result<()> {
        let escrow = &self.escrow;
        let amount = escrow.expected_amount;
        let fee_percentage = escrow.fee_percentage;

        // Calculate fee and amount after fee
        let fee: u64 = amount
            .checked_mul(fee_percentage as u64)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(100)
            .ok_or(ErrorCode::Overflow)?;

        let amount_after_fee = amount.checked_sub(fee).ok_or(ErrorCode::Overflow)?;
        let escrow_key = self.escrow.key();
        let seeds = &[
            b"escrow-token-account".as_ref(),
            escrow_key.as_ref(),
            &[*bump],
        ];
        let signer = [&seeds[..]];

        // Transfer amount after fee to service provider
        let service_provider_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            token::Transfer {
                from: self.escrow_token_account.to_account_info(),
                authority: self.escrow_token_account.to_account_info(),
                to: self.service_provider_token_account.to_account_info(),
            },
            &signer,
        );
        token::transfer(service_provider_ctx, amount_after_fee)?;

        // Transfer fee to fee account if non-zero
        if fee > 0 {
            let fee_ctx = CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                token::Transfer {
                    from: self.escrow_token_account.to_account_info(),
                    authority: self.escrow_token_account.to_account_info(),
                    to: self.fee_token_account.to_account_info(),
                },
                &signer,
            );
            token::transfer(fee_ctx, fee)?;
        }

        Ok(())
    }
}
