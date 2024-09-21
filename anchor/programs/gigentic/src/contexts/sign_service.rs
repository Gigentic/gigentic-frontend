use anchor_lang::prelude::*;

use crate::states::{Escrow, Service};
use crate::ErrorCode;

#[derive(Accounts)]
pub struct SignService<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub service: Account<'info, Service>,

    #[account(
        mut,
        seeds = [b"escrow", service.key().as_ref()],
        bump,
        close = signer // Transfer remaining lamports to the buyer when the account is closed
    )]
    pub escrow: Account<'info, Escrow>,

    /// CHECK : SAFE
    #[account(mut)]
    pub service_provider: AccountInfo<'info>,

    /// CHECK : SAFE    
    #[account(mut)]
    pub fee_account: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

impl<'info> SignService<'info> {
    pub fn handler(&mut self) -> Result<()> {
        let escrow = &mut self.escrow;
        let amount = escrow.expected_amount;
        let fee_percentage = escrow.fee_percentage;

        // Calculate the fee and the amount to transfer to the service provider
        let fee: u64 = amount
            .checked_mul(fee_percentage as u64)
            .ok_or(ErrorCode::Overflow)?
            .checked_div(100)
            .ok_or(ErrorCode::Overflow)?;

        let amount_after_fee = amount.checked_sub(fee).ok_or(ErrorCode::Overflow)?;

        let fee_account = &mut self.fee_account.to_account_info();

        let service_provider = &mut self.service_provider.to_account_info();

        let escrow = &mut self.escrow.to_account_info();

        **escrow.try_borrow_mut_lamports()? -= fee;

        **escrow.try_borrow_mut_lamports()? -= amount_after_fee;

        **fee_account.try_borrow_mut_lamports()? += fee;

        **service_provider.try_borrow_mut_lamports()? += amount_after_fee;

        Ok(())
    }
}
