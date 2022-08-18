import { ethers } from "hardhat";
import dotenv from "dotenv"
dotenv.config()

import { deployToken } from "./deployToken";

export const deployGovernor = async () => {
    const token = await deployToken()
  
    const Contract = await ethers.getContractFactory("OwnDao");
    const governor = await Contract.deploy(token.address);

    return {
      contract: await governor.deployed(),
      token
    }
}

async function main() {
  deployGovernor()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
