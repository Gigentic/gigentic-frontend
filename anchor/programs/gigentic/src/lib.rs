use anchor_lang::prelude::*;
mod constants;
mod contexts;
mod errors;
mod states;
use contexts::consumer_to_provider_rating::*;
use contexts::init_service::*;
use contexts::init_service_registry::*;
use contexts::pay_service::*;
use contexts::provider_to_consumer_rating::*;
use contexts::sign_service::*;
use errors::ErrorCode;

declare_id!("2xtwCiDhiQ9vuTFpR3wECJaHyvtE7L9pBPbNHdnsk1YS");

#[program]
pub mod gigentic {
    use super::*;

    pub fn initialize_service_registry(
        ctx: Context<InitServiceRegistry>,
        fee_account: Pubkey,
        fee_percentage: u8,
    ) -> Result<()> {
        ctx.accounts.handler(fee_account, fee_percentage)?;
        Ok(())
    }

    pub fn initialize_service(
        ctx: Context<InitializeService>,
        unique_id: String,
        description: String,
        price: u64,
    ) -> Result<()> {
        require!(
            description.len() <= constants::MAX_DESCRIPTION_LENGTH,
            ErrorCode::DescriptionTooLong
        );

        ctx.accounts.handler(unique_id, description, price)?;
        Ok(())
    }

    pub fn pay_service(ctx: Context<PayService>, review_id: String) -> Result<()> {
        ctx.accounts.handler(review_id)?;
        Ok(())
    }

    pub fn sign_service(ctx: Context<SignService>) -> Result<()> {
        ctx.accounts.handler()?;
        Ok(())
    }

    pub fn provider_to_consumer_rating(
        ctx: Context<ReviewProviderToCustomerService>,
        rating: u8,
        review: String,
    ) -> Result<()> {
        ctx.accounts.handler(rating, review)?;
        Ok(())
    }

    pub fn consumer_to_provider_rating(
        ctx: Context<ReviewCustomerToProviderService>,
        rating: u8,
        review: String,
    ) -> Result<()> {
        ctx.accounts.handler(rating, review)?;
        Ok(())
    }
}
