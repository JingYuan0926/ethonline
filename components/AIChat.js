import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Button } from "@nextui-org/react";
import { 
  TOKEN_TRANSFER_ABI, 
  CONTRACT_ADDRESS, 
  DESTINATION_CHAIN_SELECTOR_ARBI,
  CCIP_BNM_TOKEN_ADDRESS_ARBI
} from '../utils/constants';

const GALADRIEL_CONTRACT_ADDRESS = "0x31570E2d954a52f561a4D9126b50FE07b86BD796";
const GALADRIEL_CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_message",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_response",
        "type": "string"
      }
    ],
    "name": "storeConversation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLastConversation",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getConversationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

function AIChat() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [galadrielContract, setGaladrielContract] = useState(null);
  const [transferContract, setTransferContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState('');

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const galadrielContract = new ethers.Contract(GALADRIEL_CONTRACT_ADDRESS, GALADRIEL_CONTRACT_ABI, provider);
        setGaladrielContract(galadrielContract);

        const transferContract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_TRANSFER_ABI, provider);
        setTransferContract(transferContract);

        window.ethereum.on('accountsChanged', handleAccountsChanged);
      } else {
        console.log('Please install MetaMask!');
      }
    };

    init();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      if (provider) {
        const signer = provider.getSigner();
        setSigner(signer);
      }
    } else {
      setAccount(null);
      setSigner(null);
    }
  };

  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);
      if (provider) {
        const signer = provider.getSigner();
        setSigner(signer);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleTransfer = async () => {
    try {
      setTransferStatus('Initiating transfer from Ethereum to Arbitrum...');

      const receiver = await signer.getAddress();
      const amount = ethers.utils.parseUnits('0.001', 18); // 0.001 CCIP-BnM

      const transferWithSigner = transferContract.connect(signer);
      const tx = await transferWithSigner.transferTokensPayNative(
        DESTINATION_CHAIN_SELECTOR_ARBI,
        receiver,
        CCIP_BNM_TOKEN_ADDRESS_ARBI,
        amount
      );

      setTransferStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setTransferStatus(`Transfer to Arbitrum successful! Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('Error:', error);
      setTransferStatus('Error: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !signer) return;

    setLoading(true);
    setTransferStatus('');
    try {
      // Call OpenAI API
      const openAIResponse = await axios.post('/api/openai', { message });
      const aiResponse = openAIResponse.data.message;

      // Store conversation on Galadriel chain
      const galadrielWithSigner = galadrielContract.connect(signer);
      const tx = await galadrielWithSigner.storeConversation(message, aiResponse);
      await tx.wait();

      setResponse(aiResponse);
    } catch (error) {
      console.error("Error:", error);
      setResponse("An error occurred. Please try again.");
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      {!account ? (
        <Button onClick={connectWallet} color="primary">Connect Wallet</Button>
      ) : (
        <p>Connected: {account}</p>
      )}
      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          disabled={loading || !account}
          className="w-full p-2 border rounded"
        />
        <Button type="submit" disabled={loading || !account} color="primary" className="mt-2">
          {loading ? 'Processing...' : 'Send'}
        </Button>
      </form>
      {response && (
        <div className="mt-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded mb-4">
            {response}
          </div>
          <Button 
            onClick={handleTransfer} 
            color="secondary"
            className="mb-4"
          >
            Transfer ETH to Arbitrum
          </Button>
        </div>
      )}
      {transferStatus && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">
          {transferStatus}
        </div>
      )}
    </div>
  );
}

export default AIChat;