import { useState, useEffect } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Button } from "@nextui-org/react";
import Web3 from "web3";

const clientId = "BH6ij4KCYDWpINlCmEpKX0vPU17YYAw7w8WrcXa5UOM7-AfJ9vVeTdRFvhXY_PrFxPDlczgGH25cQgJHHBcoD90"; // Your Web3Auth Client ID

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7", // Sepolia testnet chain ID
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
};

const Web3AuthComponent = () => {
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3authInstance = new Web3Auth({
          clientId,
          chainConfig,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider: privateKeyProvider,
        });

        const openloginAdapter = new OpenloginAdapter({
          adapterSettings: {
            network: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            clientId,
          },
        });
        web3authInstance.configureAdapter(openloginAdapter);

        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig,
        });
        web3authInstance.configureAdapter(metamaskAdapter);

        await web3authInstance.initModal();

        setWeb3auth(web3authInstance);
      } catch (error) {
        console.error("Error initializing Web3Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      console.log("Successfully connected!", web3authProvider);
      await getAddressAndBalance(web3authProvider);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const getAddressAndBalance = async (provider) => {
    if (!provider) {
      console.log("Provider not initialized yet");
      return;
    }
    const web3 = new Web3(provider);
    try {
      const accounts = await web3.eth.getAccounts();
      const address = accounts[0];
      setAddress(address);

      const balance = await web3.eth.getBalance(address);
      const balanceInEther = web3.utils.fromWei(balance, 'ether');
      setBalance(balanceInEther);

      console.log("Address:", address);
      console.log("Balance:", balanceInEther, "ETH");
    } catch (error) {
      console.error("Error fetching address and balance:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("Web3Auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setAddress("");
    setBalance("");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const truncateAddress = (addr) => {
    return addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : '';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {!provider ? (
        <Button
          onClick={connectWallet}
          disabled={!web3auth}
          style={{ backgroundColor: '#512DA8', color: 'white' }}
          auto
        >
          Connect Wallet
        </Button>
      ) : (
        <Button 
        style={{ backgroundColor: '#512DA8', color: 'white' }} 
          auto 
          onClick={logout} 
          className="p-0 h-auto min-w-[150px]"
        >
          <div className="flex flex-col items-start py-1 px-3 w-full">
            <span className="text-s">{truncateAddress(address)}</span>
            <span className="text-s">Bal: {parseFloat(balance).toFixed(2)} ETH</span>
          </div>
        </Button>
      )}
    </div>
  );
};

export default Web3AuthComponent;