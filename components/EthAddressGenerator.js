import React, { useState } from 'react';
import { najPublicKeyStrToUncompressedHexPoint, deriveChildPublicKey, uncompressedHexPointToEvmAddress } from './kdf';

export default function EthAddressGenerator({ onAddressGenerated }) {
  const [ethAddress, setEthAddress] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateEthAddress = async () => {
    if (!derivationPath) {
      setError('Please enter a derivation path.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const parentPublicKey = najPublicKeyStrToUncompressedHexPoint();
      const childPublicKey = await deriveChildPublicKey(
        parentPublicKey,
        process.env.NEXT_PUBLIC_NEAR_ACCOUNT_ID,
        derivationPath
      );
      const address = uncompressedHexPointToEvmAddress(childPublicKey);
      setEthAddress(address);
      onAddressGenerated(address); // Pass the generated address to the parent component
    } catch (err) {
      console.error('Error generating Ethereum address:', err);
      setError('Failed to generate Ethereum address. Please check your configuration and derivation path.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <label htmlFor="derivationPath" className="block text-sm font-medium text-gray-700">
          Derivation Path
        </label>
        <input
          type="text"
          id="derivationPath"
          value={derivationPath}
          onChange={(e) => setDerivationPath(e.target.value)}
          placeholder="e.g., ethereum-1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
      </div>
      <button 
        onClick={generateEthAddress} 
        disabled={isLoading}
        className="bg-green-500 text-white px-4 py-2 rounded mb-2"
      >
        {isLoading ? 'Generating...' : 'Generate Ethereum Address'}
      </button>
      {ethAddress && (
        <div className="mt-2">
          <strong>Your Ethereum Address:</strong> {ethAddress}
        </div>
      )}
      {error && (
        <div className="text-red-500 mt-2">
          {error}
        </div>
      )}
    </div>
  );
}