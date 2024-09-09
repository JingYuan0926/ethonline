require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: "0.8.13",
    networks: {
        galadriel: {
            url: "https://devnet.galadriel.com",  // RPC URL for Galadriel
            accounts: ["e406c4584c5283658f75e90edf3e92ea4b0a44da60f9cf16a9e6d7d77083826d"],  // Add your private key here
        },
    },
};
