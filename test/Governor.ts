import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import dotenv from "dotenv"
dotenv.config()
import { Token } from '../typechain-types/contracts/Token';
import { Contract } from 'ethers';

import {deployGovernor} from "../scripts/deployGovernor" 

const getContract = () => loadFixture(deployGovernor);

const mineBlocks = async (blocks = 1)=>{
    for(let i = 0;i<blocks;i++){
        await ethers.provider.send('evm_mine',[]);
    }
}

const createAProposal = async (contract:any, token:any) => {

    const options = {
        targets: [token.address],
        value:[0],
        calldata:["0x40c10f1900000000000000000000000070716fb8170529da60c37e4855b89189bb8f86050000000000000000000000000000000000000000000000000000000000000005"],
        description:"mint 5 tokens to me",
        hashedDescription: "0x010a1e5a8bcf31c92b9b0e2f88df3e9440643684f2ce9ebb3cb5c1347ea6b622"
    }

    await contract.propose(
        options.targets,
        options.value,
        options.calldata,
        options.description
    )

    return {
        proposalId: await contract.hashProposal(
            options.targets,
            options.value,
            options.calldata,
            options.hashedDescription
        ),
        options
    }
}

const vote = async (contract:Contract, token:Token, support:number) => {
    const [owner] = await ethers.getSigners()
    const address = await owner.getAddress();

    const {proposalId} = await createAProposal(contract, token)

    await token.delegate(address)
    
    await contract.castVote(proposalId, support)

    return {proposalId,address}
}

describe("Ownership", function () {
    it("Should transfer ownership to contract", async () => {
        const {contract, token} = await getContract();

        await token.transferOwnership(contract.address)

        expect(await token.owner()).to.be.equal(contract.address)
    });
})

describe("Proposals", function() {
    it("Should create proposal", async () => {
        const {contract, token} = await getContract();

        const {proposalId} = await createAProposal(contract, token)

        await expect(contract.proposalVotes(proposalId)).to.be.eventually.ok
    });

    it("Should not create same proposal", async () => {
        const {contract, token} = await getContract();

        await createAProposal(contract, token)

        await expect(createAProposal(contract, token)).to.be.revertedWith("Governor: proposal already exists")
    });

    it("Should return deadline", async () => {
        const {contract, token} = await getContract();

        const {proposalId} = await createAProposal(contract, token)

        await expect(contract.proposalDeadline(proposalId)).to.be.eventually.ok
    })

    describe("Voting", () => {
        it("POSITIVE vote", async () => {
            const {contract, token} = await getContract();
    
            const {proposalId, address} = await vote(contract, token, 1)
    
            expect((await contract.proposalVotes(proposalId))[1]).to.be.equal(await token.balanceOf(address))
        })
    
        it("NEGATIVE vote", async () => {
            const {contract, token} = await getContract();
    
            const {proposalId, address} = await vote(contract, token, 0)
    
            expect((await contract.proposalVotes(proposalId))[0]).to.be.equal(await token.balanceOf(address))
        })
    
        it("ABSTAIN vote", async () => {
            const {contract, token} = await getContract();
    
            const {proposalId, address} = await vote(contract, token, 2)
    
            expect((await contract.proposalVotes(proposalId))[2]).to.be.equal(await token.balanceOf(address))
        })

        it("CAN NOT vote again", async () => {
            const {contract, token} = await getContract();
    
            const {proposalId} = await vote(contract, token, 2)
    
            await expect(contract.castVote(proposalId, 1)).to.be.revertedWith("GovernorVotingSimple: vote already cast")
        })
    })

    describe("Executing", () => {
        it("Should execute proposal", async () => {
            const {contract, token} = await getContract();
            const [owner] = await ethers.getSigners()
            const address = "0x70716FB8170529DA60C37E4855B89189Bb8f8605"

            const {proposalId, options} = await createAProposal(contract, token)

            
            await token.delegate(await owner.getAddress())
            await token.transferOwnership(contract.address)

            await contract.castVote(proposalId, 1)

            expect(await token.balanceOf(address)).to.be.equal(ethers.utils.parseEther("0"))
            
            await contract.execute(
                options.targets,
                options.value,
                options.calldata,
                options.hashedDescription
            )

            expect(await token.balanceOf(address)).to.be.equal(5)
        })
        

        it("Should not execute with 0 votes", async () => {
            const {contract, token} = await getContract();

            const {options} = await createAProposal(contract, token)

            await token.transferOwnership(contract.address)

            await mineBlocks(2)

            await expect(
                contract.execute(
                    options.targets,
                    options.value,
                    options.calldata,
                    options.hashedDescription
                )
            ).to.be.revertedWith('Governor: proposal not successful')
        })

        it("Should not execute unknown proposal", async () => {
            const {contract, token} = await getContract();
            const [owner] = await ethers.getSigners()
            const address = "0x70716FB8170529DA60C37E4855B89189Bb8f8605"

            const {proposalId, options} = await createAProposal(contract, token)

            
            await token.delegate(await owner.getAddress())
            await token.transferOwnership(contract.address)

            await contract.castVote(proposalId, 1)

            expect(await token.balanceOf(address)).to.be.equal(ethers.utils.parseEther("0"))
            
            const notSameDescription = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Testing"))

            await expect(
                contract.execute(
                    options.targets,
                    options.value,
                    options.calldata,
                    notSameDescription
                )
            ).to.be.revertedWith("Governor: unknown proposal id")
        })
    })
})