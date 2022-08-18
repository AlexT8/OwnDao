import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import dotenv from "dotenv"
dotenv.config()

import {deployToken} from "../scripts/deployToken" 

const getContract = () => loadFixture(deployToken);

describe("Settings", function () {
    it("Should set the NAME & SYMBOL", async () => {
        const contract = await getContract();

        const name = process.env.TOKEN_NAME
        const symbol = process.env.TOKEN_SYMBOL

        expect(await contract.name()).to.equal(name);
        expect(await contract.symbol()).to.equal(symbol);
    });

    it("Should mint 100 tokens to owner", async () => {
        const contract = await getContract();

        const [owner] = await ethers.getSigners();

        expect(await contract.balanceOf(owner.getAddress())).to.equal(ethers.utils.parseEther("100"));
    });

})

describe("Ownable", () => {
    it("Should set the owner to the main address", async () => {
        const contract = await getContract();

        const [owner] = await ethers.getSigners();
        expect(await contract.owner()).to.equal(await owner.getAddress());
    });

    it("Should transfer ownership", async () => {
        const contract = await getContract();

        const [_owner, addr1] = await ethers.getSigners();
        const addr = await addr1.getAddress()
        
        await contract.transferOwnership(addr)

        expect(await contract.owner()).to.equal(addr);
    });
})

describe("Minting", () => {
    it("Should mint tokens", async () => {
        const contract = await getContract();

        const [owner, addr1] = await ethers.getSigners();

        await contract.mint(addr1.getAddress(), ethers.utils.parseEther("5"))

        expect(await contract.balanceOf(addr1.getAddress())).to.equal(ethers.utils.parseEther("5"));
    });

    it("Should revert not owner minting", async () => {
        const contract = await getContract();

        const [owner, addr1] = await ethers.getSigners();
        const addr = await addr1.getAddress()

        await contract.transferOwnership(addr)

        await expect(contract.mint(addr, 5)).to.be.revertedWith("Ownable: caller is not the owner");
    });
})

describe("Burning", () => {
    it("Should burn tokens", async () => {
        const contract = await getContract();

        const [owner, addr1] = await ethers.getSigners();

        await contract.burn(owner.getAddress(), ethers.utils.parseEther("5"))

        expect(await contract.balanceOf(owner.getAddress())).to.equal(ethers.utils.parseEther("95"));
    });

    it("Should revert not owner burning", async () => {
        const contract = await getContract();

        const [owner, addr1] = await ethers.getSigners();
        const addr = await addr1.getAddress()

        await contract.transferOwnership(addr)

        await expect(contract.burn(addr, 5)).to.be.revertedWith("Ownable: caller is not the owner");
    });
})

describe("Governance Token", () => {
    it("Should delegate", async () => {
        const contract = await getContract();

        const [owner] = await ethers.getSigners();
        const addr = await owner.getAddress()
        
        await contract.delegate(addr)

        expect(await contract.delegates(addr)).to.equal(addr);
    });

    it("Should delegate to another address", async () => {
        const contract = await getContract();

        const [owner, addr1] = await ethers.getSigners();

        const ownerAddr = await owner.getAddress()
        const addr = await addr1.getAddress()
        
        await contract.delegate(addr)

        expect(await contract.delegates(ownerAddr)).to.equal(addr);
    });

    it("Should quit delegation", async () => {
        const contract = await getContract();
        
        const [owner, addr1] = await ethers.getSigners();

        const ownerAddr = await owner.getAddress()
        const addr = await addr1.getAddress()
        
        await contract.delegate(addr)

        expect(await contract.delegates(ownerAddr)).to.equal(addr);

        await contract.delegate("0x0000000000000000000000000000000000000000")

        expect(await contract.delegates(ownerAddr)).to.equal("0x0000000000000000000000000000000000000000");

    });

    it("Should return votes", async () => {
        const contract = await getContract();

        const [_owner, addr1] = await ethers.getSigners();

        const addr = await addr1.getAddress()
        
        await contract.mint(addr, ethers.utils.parseEther("25"))

        await contract.delegate(addr)
        await contract.connect(addr1).delegate(addr)

        expect(await contract.getVotes(addr)).to.equal(ethers.utils.parseEther("125"));
    });
    
})