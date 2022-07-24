import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { expect } from "chai";
import { ImgStorage } from "../target/types/img_storage";

describe("img_storage", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.ImgStorage as Program<ImgStorage>;

  const findAddress = () => {
    const [storageAccount, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("storage"),
        anchor.getProvider().publicKey.toBuffer(),
      ],
      program.programId
    );
    return storageAccount;
  };

  const initStorage = async () => {
    const storageAccount = findAddress();
    await program.methods
      .initialize()
      .accounts({
        storage: storageAccount,
      })
      .rpc();
    return storageAccount;
  };

  it("Initializes the empty vector", async () => {
    const storageAccount = await initStorage();
    const state = await program.account.data.fetch(storageAccount);
    expect(state.images.length).eq(0);
  });

  it("Adds a gif", async () => {
    const storageAccount = findAddress();
    await program.methods
      .addImg("https://www.google.com")
      .accounts({ storage: storageAccount })
      .rpc();
    const state = await program.account.data.fetch(storageAccount);
    expect(state.images.length).eq(1);
  });
});
