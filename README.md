# Create a Basic Own Dao

This project initializes a Token to use with the Governor Contract (DAO).
It has all the tests & configurations.

# To test:

**First create a .env file in the root of the project with the following:**
```
TOKEN_NAME="YOUR_TOKEN_NAME"
TOKEN_SYMBOL="YOUR_TOKEN_SYMBOL"
CONTRACT_NAME="YOUR_CONTRACT_NAME"
```
> My example:
```
TOKEN_NAME="ALEXTAB"
TOKEN_SYMBOL="AXT"

CONTRACT_NAME="OwnDao"
```
**Make sure `CONTRACT_NAME` is equal to the contract name in the solidity file**

Then run `npm i`
When the installation is finished run:
To test **Token** contract: `npx hardhat test test/Token.ts`
To test **Governor** contract: `npx hardhat test test/Governor.ts`