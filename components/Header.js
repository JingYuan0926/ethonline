import React from 'react';
import Image from 'next/image';
import Web3AuthComponent from "./Web3AuthComponent";

const Header = () => {
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
          <Web3AuthComponent />
        </nav>
      </div>
    </header>
  );
};

export default Header;