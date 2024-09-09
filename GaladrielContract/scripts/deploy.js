const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", balance.toString());

  // Get the contract factory
  const Galadriel = await ethers.getContractFactory("Galadriel");

  // Deploy the contract with no constructor arguments
  const galadriel = await Galadriel.deploy();

  // Wait for the contract to be deployed
  await galadriel.deployed();

  console.log("Galadriel contract deployed to:", galadriel.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
