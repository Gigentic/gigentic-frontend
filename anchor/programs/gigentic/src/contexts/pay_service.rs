use crate::states::review::Review;
use crate::states::service_registry::ServiceRegistry;
use crate::states::{Escrow, Service};
use crate::ErrorCode;
use anchor_lang::prelude::*;
#[derive(Accounts)]
#[instruction(review_id: String)]
pub struct PayService<'info> {
    #[account(mut)]
    pub customer: Signer<'info>,

    #[account(mut)]
    pub service: Account<'info, Service>,

    #[account(mut)]
    service_registry: Account<'info, ServiceRegistry>,

    #[account(
        init,
        payer = customer,
        space = 8+ Escrow::INIT_SPACE,
        seeds = [b"escrow", service.key().as_ref(), service.provider.key().as_ref(), customer.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
    init,
    payer = customer,
    space =8+ Review::INIT_SPACE,
    seeds=[b"review",review_id.as_bytes(),service.key().as_ref()],
    bump,
    )]
    pub review: Account<'info, Review>,
    pub system_program: Program<'info, System>,
}

impl<'info> PayService<'info> {
    pub fn handler(&mut self, review_id: String) -> Result<()> {
        let service_price = self.service.price;

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &self.customer.key(),
            &self.escrow.key(),
            service_price,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                self.customer.to_account_info(),
                self.escrow.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )?;

        self.service.reviews.push(self.review.key());
        if let Some(last_address) = self.service.reviews.last() {
            msg!(" Last review address: {}", last_address);
        } else {
            return err!(ErrorCode::NoReviews);
        }
        self.review.set_inner(Review {
            review_id,
            provider_to_customer_rating: 0,
            customer_to_provider_rating: 0,
            customer: self.customer.key(),
            service_provider: self.service.provider.key(),
            provider_to_customer_review: String::from(""),
            customer_to_provider_review: String::from(""),
        });

        self.escrow.set_inner(Escrow {
            fee_account: self.service_registry.fee_account,
            fee_percentage: self.service_registry.fee_percentage,
            customer: self.customer.key(),
            service_provider: self.service.provider,
            expected_amount: service_price,
            escrow_token_account: None,
            fee_token_account: None,
            service_provider_token_account: None,
        });

        Ok(())
    }
}
