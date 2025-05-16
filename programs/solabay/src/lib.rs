use anchor_lang::prelude::*;

#[program]
pub mod solana_marketplace {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, price_floor: u64, price_cap: u64, initial_supply: u64, period_days: u64) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.price_floor = price_floor;
        marketplace.price_cap = price_cap;
        marketplace.initial_supply = initial_supply;
        marketplace.sold_amount = 0;
        marketplace.period_days = period_days;
        marketplace.start_time = Clock::get()?.unix_timestamp;
        Ok(())
    }

    pub fn list_product(ctx: Context<ListProduct>, price: u64, description: String) -> Result<()> {
        let product = &mut ctx.accounts.product;
        product.owner = *ctx.accounts.owner.key;
        product.price = price;
        product.description = description;
        product.is_sold = false;
        Ok(())
    }

    pub fn buy_product(ctx: Context<BuyProduct>) -> Result<()> {
        let product = &mut ctx.accounts.product;
        let buyer = &ctx.accounts.buyer;

        require!(!product.is_sold, MarketplaceError::ProductAlreadySold);

        product.is_sold = true;
        product.owner = *buyer.key;
        Ok(())
    }

    pub fn update_price(ctx: Context<UpdatePrice>, current_time: i64) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;

        let elapsed_time = current_time - marketplace.start_time;
        let f_t = marketplace.sold_amount as f64 / (marketplace.initial_supply as f64 / marketplace.period_days as f64 * elapsed_time as f64);

        let mut price = if f_t >= 1.0 {
            let adjusted_price = marketplace.initial_price as f64 * (1.0 + marketplace.sensitivity_coefficient * (f_t - 1.0));
            adjusted_price.min(marketplace.price_cap as f64)
        } else {
            let adjusted_price = marketplace.initial_price as f64 * (1.0 - marketplace.sensitivity_coefficient * (1.0 - f_t));
            adjusted_price.max(marketplace.price_floor as f64)
        };

        marketplace.current_price = price as u64;
        Ok(())
    }
}

#[account]
pub struct Marketplace {
    pub price_floor: u64,
    pub price_cap: u64,
    pub initial_supply: u64,
    pub sold_amount: u64,
    pub period_days: u64,
    pub start_time: i64,
    pub initial_price: u64,
    pub current_price: u64,
    pub sensitivity_coefficient: f64,
}

#[account]
pub struct Product {
    pub owner: Pubkey,
    pub price: u64,
    pub description: String,
    pub is_sold: bool,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8)]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ListProduct<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 8 + 100 + 1)]
    pub product: Account<'info, Product>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyProduct<'info> {
    #[account(mut)]
    pub product: Account<'info, Product>,
    #[account(mut)]
    pub buyer: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdatePrice<'info> {
    #[account(mut)]
    pub marketplace: Account<'info, Marketplace>,
}

#[error_code]
pub enum MarketplaceError {
    #[msg("Product is already sold")]
    ProductAlreadySold,
}
