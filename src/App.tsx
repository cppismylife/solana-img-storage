import "./App.css";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRef, useEffect, useState } from "react";
import * as anchor from "@project-serum/anchor";
import idl from "./program-idl.json";

const App = () => {
  const { publicKey } = useWallet();

  return (
    <div className="App">
      <div className={publicKey ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">Image Portal</p>
          <p className="sub-text">
            View your image collection in the metaverse ✨
          </p>
          {!publicKey ? (
            <WalletMultiButton
              className={"connect wallet-adapter-button-trigger"}
            />
          ) : (
            <Images />
          )}
        </div>
      </div>
    </div>
  );
};

const Images = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const inputValue = useRef("");
  const provider = new anchor.AnchorProvider(connection, window.solana, {
    preflightCommitment: "processed",
  });
  const program = new anchor.Program(
    idl as anchor.Idl,
    idl.metadata.address,
    provider
  );
  const [images, setImages]: [string[], any] = useState([]);
  const [hasStorage, setStatus] = useState(false);

  const findStorageAddress = () => {
    if (!publicKey) throw new WalletNotConnectedError();
    const [address] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("storage"),
        new anchor.web3.PublicKey(publicKey).toBuffer(),
      ],
      program.programId
    );
    return address;
  };

  useEffect(() => {
    (async () => {
      const address = findStorageAddress();
      const storage = await program.account.data.getAccountInfo(address);
      if (storage?.owner) {
        const userImages = await fetchImgs(address);
        if (userImages) {
          setImages(userImages);
          setStatus(true);
        } else setImages([]);
      } else setStatus(false);
    })();
  }, [publicKey]);

  const fetchImgs = async (address: anchor.web3.PublicKey) => {
    let userImages = (await program.account.data.fetch(address))
      .images as string[];
    return userImages;
  };

  const initStorage = async () => {
    const address = findStorageAddress();
    const tx = await program.methods
      .initialize()
      .accounts({ storage: address })
      .rpc();
    console.log("Storage initialized: " + tx);
    setStatus(true);
  };

  const addImg = async () => {
    const address = findStorageAddress();
    const tx = await program.methods
      .addImg(inputValue.current)
      .accounts({ storage: address })
      .rpc();
    console.log("Image added: " + tx);
    setImages(await fetchImgs(address));
  };

  if (!hasStorage)
    return (
      <div className="connected-container">
        <p className="sub-text" style={{ fontStyle: "italic" }}>
          First, you need to initialize your storage
        </p>
        <button className="cta-button submit-img-button" onClick={initStorage}>
          Initialize
        </button>
      </div>
    );
  else
    return (
      <div className="connected-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addImg();
          }}
        >
          <input
            type="text"
            placeholder="Enter image link"
            onChange={(e) => {
              inputValue.current = e.target.value;
            }}
          />
          <button type="submit" className="cta-button submit-img-button">
            Submit
          </button>
        </form>
        {images.length ? (
          <div className="grid">
            {images.map((img) => (
              <div className="grid-item" key={img}>
                <img src={img} alt={img} />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
};

export default App;
