// components/WalletConnect.js
import React, { useState, useEffect } from 'react';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { Button } from '@nextui-org/react';

// Import other wallet modules as needed

const WalletConnect = () => {
  const [selector, setSelector] = useState(null);
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    initWalletSelector();
  }, []);

  const initWalletSelector = async () => {
    const walletSelector = await setupWalletSelector({
      network: "testnet",
      modules: [
        setupMyNearWallet(),
        // Add other wallet modules here
      ],
    });

    const newModal = setupModal(walletSelector, {
      contractId: "guest-book.testnet" // Replace with your contract ID
    });

    setSelector(walletSelector);
    setModal(newModal);

    const state = walletSelector.store.getState();
    setAccounts(state.accounts);

    // Subscribe to changes in wallet state
    walletSelector.store.observable.subscribe((state) => {
      setAccounts(state.accounts);
    });
  };

  const handleWalletConnect = () => {
    if (!modal) return;
    modal.show();
  };

  const handleWalletDisconnect = async () => {
    if (!selector) return;
    const wallet = await selector.wallet();
    await wallet.signOut();
  };

  return (
    <div>
      {accounts.length === 0 ? (
        <Button onClick={handleWalletConnect}>Connect Wallet</Button>
      ) : (
        <div>
          <Button onClick={handleWalletDisconnect}>Disconnect</Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;