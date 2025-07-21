const hre = require("hardhat");

async function main() {
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const contract = await BuyMeACoffee.deploy();
  await contract.waitForDeployment();

  console.log("BuyMeACoffee deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
