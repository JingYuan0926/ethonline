import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Select, SelectItem } from "@nextui-org/react";
import { 
  TOKEN_TRANSFER_ABI, 
  CONTRACT_ADDRESS, 
  DESTINATION_CHAIN_SELECTOR_POLY, 
  CCIP_BNM_TOKEN_ADDRESS_POLY,
  DESTINATION_CHAIN_SELECTOR_ARBI,
  CCIP_BNM_TOKEN_ADDRESS_ARBI
} from '../utils/constants';

const EthToChainTransferComponent = () => {
  const [status, setStatus] = useState('');
  const [destinationChain, setDestinationChain] = useState('0'); // 0 for Polygon, 1 for Arbitrum

  const handleTransfer = async () => {
    try {
      const chainName = destinationChain === '0' ? 'Polygon' : 'Arbitrum';
      setStatus(`Initiating transfer from Ethereum to ${chainName}...`);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask to use this feature.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, TOKEN_TRANSFER_ABI, signer);

      const receiver = await signer.getAddress(); // Using the current address as receiver
      const amount = ethers.utils.parseUnits('0.001', 18); // 0.001 CCIP-BnM

      const destinationSelector = destinationChain === '0' ? DESTINATION_CHAIN_SELECTOR_POLY : DESTINATION_CHAIN_SELECTOR_ARBI;
      const tokenAddress = destinationChain === '0' ? CCIP_BNM_TOKEN_ADDRESS_POLY : CCIP_BNM_TOKEN_ADDRESS_ARBI;

      const tx = await contract.transferTokensPayNative(
        destinationSelector,
        receiver,
        tokenAddress,
        amount
      );

      setStatus('Transaction sent. Waiting for confirmation...');
      await tx.wait();
      setStatus(`Transfer to ${chainName} successful! Transaction hash: ${tx.hash}`);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div className="p-4">
      <Select 
        label="Select Destination Chain" 
        value={destinationChain}
        onChange={(e) => setDestinationChain(e.target.value)}
        className="mb-4"
      >
        <SelectItem key="0" value="0">Polygon</SelectItem>
        <SelectItem key="1" value="1">Arbitrum</SelectItem>
      </Select>
      <Button 
        onClick={handleTransfer} 
        color="primary"
        className="mb-4"
      >
        Transfer ETH to {destinationChain === '0' ? 'Polygon' : 'Arbitrum'}
      </Button>
      {status && (
        <div className="mt-4 p-4 bg-blue-100 text-blue-700 rounded">
          {status}
        </div>
      )}
    </div>
  );
};

export default EthToChainTransferComponent;