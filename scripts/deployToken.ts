import { ethers } from "hardhat";
import dotenv from "dotenv"

export const deployContract = async () => {
  const { TOKEN_NAME, TOKEN_SYMBOL} = process.env
  console.log(TOKEN_NAME)
  const Contract = await ethers.getContractFactory("Token");
  const token = await Contract.deploy(TOKEN_NAME, TOKEN_SYMBOL);

  return token.deployed();
}

async function main() {
  await deployContract();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
