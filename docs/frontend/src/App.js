import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./constants";

function App() {
  const [account, setAccount] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  // Connect wallet function (same as before)
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("User rejected wallet connection");
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  // Load memos from contract
  async function getMemos() {
    if (!window.ethereum) return;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    try {
      const memosFromContract = await contract.getMemos();
      console.log("Fetched memos:", memosFromContract); // Add this log
      setMemos(memosFromContract);
    } catch (error) {
      console.error(error);
    }
  }

  // Buy coffee (send ETH + message)
  async function buyCoffee(e) {
    e.preventDefault();
    if (!window.ethereum) return alert("Please install MetaMask");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const tx = await contract.buyCoffee(
        name || "anon",
        message || "Enjoy your coffee!",
        {
          value: ethers.parseEther("0.001"),
        }
      );

      await tx.wait();
      alert("Coffee purchased! Thanks!");
      setName("");
      setMessage("");
      getMemos(); // refresh memos
    } catch (error) {
      console.error(error);
      alert("Transaction failed!");
    }
  }

  // React lifecycle
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      });
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
      });
    }

    getMemos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Buy Me A Coffee DApp</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected account: {account}</p>

          <form onSubmit={buyCoffee} style={{ marginBottom: 20 }}>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <input
              type="text"
              placeholder="Say something nice"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ marginRight: 10 }}
            />
            <button type="submit">Buy Coffee (0.001 ETH)</button>
          </form>

          <h2>Messages</h2>
          {memos.length === 0 && <p>No messages yet</p>}
          {memos.map((memo, idx) => (
            <div key={idx}>
              <p>
                <strong>From:</strong> {memo.name} ({memo.from})
              </p>
              <p>
                <strong>Message:</strong> {memo.message}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {new Date(Number(memo.timestamp) * 1000).toLocaleString()}
              </p>
              <hr />
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default App;
