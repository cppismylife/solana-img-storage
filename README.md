# Solana Image Storage

This app can store urls of images on-chain and display them on website. Each user can have his own storage that only he will have access to.

## If you want to change something

1. Make your changes
2. Run `anchor build`
3. Get program address with `solana address -k target/deploy/img_storage-keypair.json` and replace with it every occurency in `lib.rs` and `Anchor.toml`
4. Run `anchor deploy`
5. Copy `anchor/target/idl/img_storage.json` to `src/program-idl.json`
