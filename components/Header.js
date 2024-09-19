import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";

const Header = () => {
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const initializeWalletSelector = async () => {
      const selector = await setupWalletSelector({
        network: "testnet",
        modules: [setupNearWallet()],
      });

      const walletModal = setupModal(selector, {
        contractId: "test.testnet", // Change to your contractId
      });

      setModal(walletModal);
    };

    initializeWalletSelector();
  }, []);

  const handleLogin = () => {
    if (modal) {
      modal.show(); // Show the NEAR wallet modal
    }
  };

  return (
    <header className="w-full">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="logo">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
          />
        </div>
        <nav className="flex items-center space-x-6">
          <a href="/chat" className="text-white hover:text-gray-300 transition-colors">Home</a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Rewards</a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">Scan</a>
          <a href="#" className="text-white hover:text-gray-300 transition-colors">About Us</a>
          {/* Add the Login Button */}
          <a href="#" onClick={handleLogin} className="text-white hover:text-gray-300 transition-colors">
            Login
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
