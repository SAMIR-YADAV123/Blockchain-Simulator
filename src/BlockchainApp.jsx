import React, { useState } from "react";
import { sha256 } from "js-sha256";
import "./App.css";


class Blockchain {
  constructor(difficulty = 2) {
    // To store the list of blocks
    this.chain = [];
    this.createGenesisBlock();
  }

  // Creating the first block which is also called Genesis Block
  createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: new Date().toISOString(),
      transactions: "Genesis Block",
      previousHash: "0",
      nonce: 0,    //here i have added one more field nonce , a random number which will improve the security
      hash: this.calculateHash("Genesis Block", "0", 0),
    };
    this.chain.push(genesisBlock);
  }

  // Calculate the hash of a block(nonce also added for calculation of hash)
  calculateHash(transactions, previousHash, nonce) {
    return sha256(transactions + previousHash + nonce).toString();
  }

  // Perform Proof-of-Work: Find a hash that starts with the required number of zeros
  mineBlock(transactions, previousHash) {
    let nonce = 0;  
    let hash = this.calculateHash(transactions, previousHash, nonce);

    while (!hash.startsWith("00")) {
      nonce++;
      hash = this.calculateHash(transactions, previousHash, nonce);
    }
    return { hash, nonce };
  }

  
  // Add a new block with custom data
  addBlock(data) {
    const previousBlock = this.chain[this.chain.length - 1];
    const newTimestamp = new Date().toISOString();
    const previousHash = previousBlock.hash;

    // Mine the block (Proof-of-Work)
    const { hash, nonce } = this.mineBlock(data, previousHash);   

    const newBlock = {
      index: previousBlock.index + 1,
      timestamp: newTimestamp,
      transactions: data,
      previousHash,
      nonce,
      hash,
    };

    this.chain.push(newBlock);
  }


  //creating the local variable to detet the tempering in the last block
  islast=false;

  // Validate the integrity of the blockchain
  isChainValid() {

    //for last block tempering case
    if(this.islast)
      return false;

    for (let i = 0; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
  
      // Recalculate the hash and compare it with the stored hash
      if(
        currentBlock.hash !==
        this.calculateHash(
          currentBlock.transactions,
          currentBlock.previousHash,
          currentBlock.nonce
        )
      ) {
        return false; // Invalid hash
      }
  
      // Validate the link to the previous block (only for non-genesis blocks)
      if (i > 0 && currentBlock.previousHash !== this.chain[i - 1].hash) {
        return false; // Broken chain link
      }
    }
    return true; // Blockchain is valid
  }

  // Tamper with a block in the chain and update its hash
  tamperBlock(index, newTransactions) {
    if (index > 0 && index < this.chain.length) {

      //detecting the last block temper case
      if(index===this.chain.length-1)
          this.islast=true;

      // Change the data of the block
      this.chain[index].transactions = newTransactions;

      // Recalculate the hash for the tampered block
      this.chain[index].hash = this.calculateHash(
        newTransactions,
        this.chain[index].previousHash,
        this.chain[index].nonce
      );
    }
  }
}


//Displaying the Blockchain data on the screen

const BlockchainApp = () => {
  const [blockchain] = useState(new Blockchain());
  const [blocks, setBlocks] = useState([...blockchain.chain]);
  const [status, setStatus] = useState("");  //Check Blockchain is valid or not
  const [customData, setCustomData] = useState(""); // Custom data for a new block
  const [tamperIndex, setTamperIndex] = useState(""); // Index of the block to tamper
  const [tamperData, setTamperData] = useState(""); // New data for the block

  // Add a new block with custom data
  const handleAddBlock = () => {
    if (customData.trim() === "") {
      setStatus("Please enter some data for the block.");
      return;
    }

    blockchain.addBlock(customData);
    setBlocks([...blockchain.chain]);
    setStatus("New block added!");
    setCustomData(""); // Clear the input field after adding the block
  };

  // Validate the blockchain
  const handleValidateChain = () => {
    const isValid = blockchain.isChainValid();
    setStatus(isValid ? "Blockchain is valid." : "Blockchain is invalid!");
  };

  // Tamper with a block's data
  const handleTamperBlock = () => {
    const index = parseInt(tamperIndex, 10);
    if (isNaN(index) || index < 0 || index >= blockchain.chain.length) {
      setStatus("Invalid block index for tampering.");
      return;
    }

    if (tamperData.trim() === "") {
      setStatus("Please enter new data to tamper with the block.");
      return;
    }

    blockchain.tamperBlock(index, tamperData);
    setBlocks([...blockchain.chain]);
    setStatus(`Block #${index} has been tampered with!`);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Blockchain Simulation</h1>
      <div className="button-group">
        <input
          type="text"
          value={customData}
          onChange={(e) => setCustomData(e.target.value)}
          placeholder="Enter block data"
          className="input"
        />
        <button className="btn" onClick={handleAddBlock}>
          Add Block
        </button>
        <button className="btn" onClick={handleValidateChain}>
          Validate Blockchain
        </button>
      </div>
      <p className="status">{status}</p>

      <div className="tamper-section">
        <h2>Tamper with a Block</h2>
        <input
          type="number"
          value={tamperIndex}
          onChange={(e) => setTamperIndex(e.target.value)}
          placeholder="Block Index"
          className="input"
        />
        <input
          type="text"
          value={tamperData}
          onChange={(e) => setTamperData(e.target.value)}
          placeholder="New Data"
          className="input"
        />
        <button className="btn danger" onClick={handleTamperBlock}>
          Tamper Block
        </button>
      </div>

      <div className="blockchain">
        {blocks.map((block) => (
          <div className="block-card" key={block.index}>
            <h3>Block #{block.index}</h3>
            <p>
              <strong>Timestamp:</strong> {block.timestamp}
            </p>
            <p>
              <strong>Data:</strong> {block.transactions}
            </p>
            <p>
              <strong>Previous Hash:</strong> {block.previousHash}
            </p>
            <p>
              <strong>Hash:</strong> {block.hash}
            </p>
            {/* <p>
              <strong>Nonce:</strong> {block.nonce}
            </p> */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockchainApp;
