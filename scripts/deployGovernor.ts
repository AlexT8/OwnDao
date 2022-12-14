import { ethers } from "hardhat";
import dotenv from "dotenv"
dotenv.config()

import { deployToken } from "./deployToken";

export const deployGovernor = async () => {
    const token = await deployToken()
    const name:string = process.env.CONTRACT_NAME || ""

    const Contract = await ethers.getContractFactory(name);
    const governor = await Contract.deploy(name, token.address);

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
