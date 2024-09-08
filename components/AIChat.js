import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';

const CONTRACT_ADDRESS = "0x31570E2d954a52f561a4D9126b50FE07b86BD796";
const CONTRACT_ABI = [
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
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        setContract(contract);

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

      // Ensure provider is initialized before trying to get the signer
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

      // Ensure provider is available
      if (provider) {
        const signer = provider.getSigner();
        setSigner(signer);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !signer) return;

    setLoading(true);
    try {
      // Call OpenAI API
      const openAIResponse = await axios.post('/api/openai', { message });
      const aiResponse = openAIResponse.data.message;

      // Store conversation on Galadriel chain
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.storeConversation(message, aiResponse);
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
    <div>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          disabled={loading || !account}
        />
        <button type="submit" disabled={loading || !account}>
          {loading ? 'Processing...' : 'Send'}
        </button>
      </form>
      {response && <p>Response: {response}</p>}
    </div>
  );
}

export default AIChat;
