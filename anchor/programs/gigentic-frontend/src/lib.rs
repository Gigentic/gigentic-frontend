#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("F2k6F2Uebns2TSywCKE9JiRYTMV85L4KbQNTos9kufGu");

#[program]
pub mod gigentic_frontend {
    use super::*;

  pub fn close(_ctx: Context<CloseGigenticFrontend>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.gigentic_frontend.count = ctx.accounts.gigentic_frontend.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.gigentic_frontend.count = ctx.accounts.gigentic_frontend.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeGigenticFrontend>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.gigentic_frontend.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeGigenticFrontend<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + GigenticFrontend::INIT_SPACE,
  payer = payer
  )]
  pub gigentic_frontend: Account<'info, GigenticFrontend>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseGigenticFrontend<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub gigentic_frontend: Account<'info, GigenticFrontend>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub gigentic_frontend: Account<'info, GigenticFrontend>,
}

#[account]
#[derive(InitSpace)]
pub struct GigenticFrontend {
  count: u8,
}
