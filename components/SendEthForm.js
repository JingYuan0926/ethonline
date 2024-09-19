// components/SendEthForm.js
import React, { useState } from 'react';
import { connect, KeyPair, keyStores } from 'near-api-js';
import { parseNearAmount } from 'near-api-js/lib/utils/format';
import { Ethereum } from '../lib/ethereum';

export default function SendEthForm({ fromAddress }) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const sendEth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTxHash('');

    try {
      // Initialize NEAR connection
      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      const nearConfig = {
        networkId: 'testnet',
        keyStore,
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };
      const near = await connect(nearConfig);
      const account = await near.account(process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID);

      // Initialize Ethereum service
      const ethereum = new Ethereum(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL, 11155111); // Sepolia testnet

      // Create payload
      const { transaction, payload } = await ethereum.createPayload(fromAddress, toAddress, amount);

      // Request signature from MPC
      const wallet = account.connection.signer;
      const derivationPath = sessionStorage.getItem('derivation');
      const { big_r, s, recovery_id } = await ethereum.requestSignatureToMPC(
        wallet,
        process.env.NEXT_PUBLIC_MPC_CONTRACT_ID,
        derivationPath,
        payload
      );

      // Reconstruct signature
      const signedTx = await ethereum.reconstructSignatureFromLocalSession(big_r, s, recovery_id, fromAddress);

      // Relay transaction
      const txHash = await ethereum.relayTransaction(signedTx);
      setTxHash(txHash);
    } catch (err) {
      console.error('Error sending ETH:', err);
      setError('Failed to send ETH. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={sendEth} className="space-y-4">
      <div>
        <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">To Address</label>
        <input
          type="text"
          id="toAddress"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (ETH)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
          step="0.000000000000000001"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Sending...' : 'Send ETH'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
      {txHash && <p className="text-green-500">Transaction successful! Hash: {txHash}</p>}
    </form>
  );
}