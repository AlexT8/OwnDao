import { ethers } from "hardhat";
import dotenv from "dotenv"
dotenv.config()

export const deployToken = async () => {
  const TOKEN_NAME:string = process.env.TOKEN_NAME || ""
  const TOKEN_SYMBOL:string = process.env.TOKEN_SYMBOL || ""

  const Contract = await ethers.getContractFactory("Token");
  const token = await Contract.deploy(TOKEN_NAME, TOKEN_SYMBOL);

  return token.deployed();
}

async function main() {
  await deployToken()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
