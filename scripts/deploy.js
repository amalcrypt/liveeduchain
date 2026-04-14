const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with the account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance));

    console.log("\nGetting contract factory for AdminAuth...");
    const AdminAuthFactory = await ethers.getContractFactory("AdminAuth");
    console.log("Successfully got contract factory.");

    console.log("\nDeploying AdminAuth contract...");
    const adminAuthContract = await AdminAuthFactory.deploy();
    
    console.log("Waiting for deployment transaction to be mined...");
    const txReceipt = await adminAuthContract.deploymentTransaction().wait(1);
    const contractAddress = await adminAuthContract.getAddress();
    const deployedBlock = txReceipt.blockNumber;
    
    if (txReceipt.status === 0) {
      throw new Error("Deployment transaction failed");
    }

    console.log("✅ AdminAuth contract successfully deployed to:", contractAddress);
    console.log("✅ Deployed in block:", deployedBlock);

    saveArtifacts(adminAuthContract, contractAddress, deployedBlock);

  } catch (error) {
    console.error("🚨 DEPLOYMENT FAILED:", error);
    process.exit(1);
  }
}

function saveArtifacts(contract, address, deployedBlock) {
  console.log("\nSaving contract artifacts...");
  const artifactsDir = path.join(__dirname, "..", "src", "artifacts");

  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  // Save the contract address and deployed block
  fs.writeFileSync(
    path.join(artifactsDir, "contract-address.json"),
    JSON.stringify({ 
      address: address,
      deployedBlock: Number(deployedBlock)
    }, undefined, 2)
  );

  // Save the contract ABI
  const contractArtifact = artifacts.readArtifactSync("AdminAuth");
  fs.writeFileSync(
    path.join(artifactsDir, "AdminAuth.json"),
    JSON.stringify(contractArtifact, null, 2)
  );

  console.log("✅ Contract artifacts saved to src/artifacts");
}

main();
