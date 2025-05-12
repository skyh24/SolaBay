use anchor_lang::prelude::*;

declare_id!("F4h8Z4RwQ9bBRCLrLayjYGjrDbRq34JcFUfQGdGP2ynV");

#[program]
pub mod solabay {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
