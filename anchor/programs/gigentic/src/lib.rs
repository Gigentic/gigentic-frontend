use anchor_lang::prelude::*;
mod constants;
mod contexts;
mod errors;
mod states;
use contexts::agent_to_consumer_rating::*;
use contexts::consumer_to_agent_rating::*;
use contexts::init_service::*;
use contexts::init_service_registry::*;
use contexts::pay_service::*;
use contexts::sign_service::*;
use errors::ErrorCode;

declare_id!("J2UENgBQrdJFy2NcFbBsxyHHdi4CZVuBg5FXmbYxfu4");

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

    pub fn pay_service(ctx: Context<PayService>, review_no: String) -> Result<()> {
        ctx.accounts.handler(review_no)?;
        Ok(())
    }

    pub fn sign_service(ctx: Context<SignService>) -> Result<()> {
        ctx.accounts.handler()?;
        Ok(())
    }

    pub fn agent_to_consumer_rating(
        ctx: Context<ReviewAgentToCustomerService>,
        rating: u8,
        review: String,
        review_no: String,
    ) -> Result<()> {
        ctx.accounts.handler(rating, review, review_no)?;
        Ok(())
    }

    pub fn consumer_to_agent_rating(
        ctx: Context<ReviewCustomerToAgentService>,
        rating: u8,
        review: String,
        review_no: String,  
    ) -> Result<()> {
        ctx.accounts.handler(rating, review, review_no)?;
        Ok(())
    }
}
