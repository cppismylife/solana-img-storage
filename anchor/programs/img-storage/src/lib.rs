use anchor_lang::prelude::*;
declare_id!("6ys78w5yUAncW2bzephZCd5pJFy7eENyoMzqU61vGqQq");

#[program]
pub mod img_storage {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.images = Vec::<String>::new();
        Ok(())
    }

    pub fn add_img(ctx: Context<AddImg>, img: String) -> Result<()> {
        let storage = &mut ctx.accounts.storage;
        storage.images.push(img);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer=user, space=9000, seeds=[b"storage", user.key().as_ref()], bump)]
    pub storage: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddImg<'info> {
    #[account(mut, seeds=[b"storage", user.key().as_ref()], bump)]
    pub storage: Account<'info, Data>,
    pub user: Signer<'info>,
}

#[account]
pub struct Data {
    images: Vec<String>,
}
