use crate::states::review::Review;
use anchor_lang::prelude::*;
use crate::states::service_registry::ServiceRegistry;
use crate::states::{Escrow, Service};
#[derive(Accounts)]
#[instruction(review_no: String)]
pub struct PayService<'info> {
    // The signer who will sign the transaction
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut,
    realloc=8+ Service::INIT_SPACE,
    realloc::payer = buyer,
    realloc::zero = true,
    )]

    pub service: Account<'info, Service>,
    #[account(mut)]
    service_registry: Account<'info, ServiceRegistry>,
    #[account(
        init,
        payer = buyer,
        space = 8+ Escrow::INIT_SPACE,
        seeds = [b"escrow", service.key().as_ref(), service.provider.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,

    #[account(
    init,
    payer = buyer,
    space =8+ Review::INIT_SPACE,
    seeds=[b"review_service",review_no.as_bytes(),service.key().as_ref(),],
    bump,       
    )]
    pub review: Account<'info, Review>,
    pub system_program: Program<'info, System>,
}

impl<'info> PayService<'info> {
    pub fn handler(&mut self, review_no: String) -> Result<()> {
        let service_price = self.service.price;

        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &self.buyer.key(),
            &self.escrow.key(),
            service_price,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                self.buyer.to_account_info(),
                self.escrow.to_account_info(),
                self.system_program.to_account_info(),
            ],
        )?;

        self.review.set_inner(Review {
            review_no,
            agent_to_consumer_rating: 0,
            consumer_to_agent_rating: 0,
            consumer: self.buyer.key(),
            service_provider: self.service.provider.key(),
            agent_to_customer_review: String::from(""),
            customer_to_agent_review: String::from(""),
        });

        self.escrow.set_inner(Escrow {
            fee_account: self.service_registry.fee_account,
            fee_percentage: self.service_registry.fee_percentage,
            buyer: self.buyer.key(),
            service_provider: self.service.provider,
            expected_amount: service_price,
        });

        self.
        service.
        reviews.push(self.review.key());
        Ok(())
    }
}

