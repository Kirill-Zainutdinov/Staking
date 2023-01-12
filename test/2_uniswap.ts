import { loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
import { BigNumber } from "ethers"

describe("Testing Uniswap",  function () {

    async function deployContracts() {

        const router = await ethers.getContractAt("IUniswapV2Router02",  process.env.ROUTER_ADDRESS as string)
        const factory = await ethers.getContractAt("IUniswapV2Factory", process.env.FACTORY_ADDRESS as string)
        const ERC20 = await ethers.getContractFactory("ERC20")
        const [owner, account, hacker] = await ethers.getSigners()

        let name = "TokenA"
        let symbol = "TNA"
        let decimals = 18
        let tokenA = await ERC20.deploy(name, symbol, decimals)
        await tokenA.deployed()

        name = "TokenB"
        symbol = "TNB"
        decimals = 18
        let tokenB = await ERC20.deploy(name, symbol, decimals)
        await tokenB.deployed()
        
        if (tokenA.address > tokenB.address){
            let tmp = tokenA
            tokenA = tokenB
            tokenB = tmp
        }

        return { tokenA, tokenB, router, factory, decimals, owner, account, hacker }
    }

    describe("Add Liquidity", function () {

        it("Check that token emission correctly changes the balance of the account", async function () {
            const { tokenA, tokenB, decimals, owner } = await loadFixture(deployContracts)

            // mint tokenA
            const balanceBeforeMintA = await tokenA.balanceOf(owner.address)
            const tokenEmissionA = BigNumber.from(10).pow(decimals)
            let tx  = await tokenA.mint(owner.address, tokenEmissionA)
            await tx.wait()

            expect(await tokenA.balanceOf(owner.address))
            .to.equal(balanceBeforeMintA.add(tokenEmissionA))

            // mint tokenB 
            const balanceBeforeMintB = await tokenB.balanceOf(owner.address)
            const tokenEmissionB = BigNumber.from(10).mul(tokenEmissionA)
            tx  = await tokenB.mint(owner.address, tokenEmissionB)
            await tx.wait()

            expect(await tokenB.balanceOf(owner.address))
            .to.equal(balanceBeforeMintB.add(tokenEmissionB))
        })

        it("Check that the function approve works correctly", async function () {
            const { tokenA, tokenB, router, decimals, owner } = await loadFixture(deployContracts)

            // mint tokenA
            const tokenEmissionA = BigNumber.from(10).pow(decimals)
            let tx  = await tokenA.mint(owner.address, tokenEmissionA)
            await tx.wait()

            // mint tokenB 
            const tokenEmissionB = BigNumber.from(10).mul(tokenEmissionA)
            tx  = await tokenB.mint(owner.address, tokenEmissionB)
            await tx.wait()

            // Allow the router to spend tokenA
            const allowanceBeforeApproveA = await tokenA.allowance(owner.address, router.address)
            tx  = await tokenA.approve(router.address, tokenEmissionA);
            await tx.wait();
            
            expect(await tokenA.allowance(owner.address, router.address))
            .to.equal(allowanceBeforeApproveA.add(tokenEmissionA))

            // Allow the router to spend tokenA
            const allowanceBeforeApproveB = await tokenB.allowance(owner.address, router.address)
            tx  = await tokenB.approve(router.address, tokenEmissionB);
            await tx.wait();
            expect(await tokenB.allowance(owner.address, router.address))
            .to.equal(allowanceBeforeApproveB.add(tokenEmissionB))
        })

        it("Check that the LP Token is created correctly", async function () {
            const { tokenA, tokenB, router, factory, decimals, owner } = await loadFixture(deployContracts)

            // mint tokenA 
            const tokenEmissionA = BigNumber.from(10).pow(decimals)
            let tx  = await tokenA.mint(owner.address, tokenEmissionA)
            await tx.wait()

            // mint tokenB 
            const tokenEmissionB = BigNumber.from(10).mul(tokenEmissionA)
            tx  = await tokenB.mint(owner.address, tokenEmissionB)
            await tx.wait()

            // allow the router to spend tokens
            tx  = await tokenA.approve(router.address, tokenEmissionA);
            await tx.wait();

            tx  = await tokenB.approve(router.address, tokenEmissionB);
            await tx.wait();

            // create liquidity pair
            const blockNumber = await ethers.provider.getBlockNumber()
            const block = await ethers.provider.getBlock(blockNumber)
            let deadline = block.timestamp + 100
    
            tx = await router.addLiquidity(
                tokenA.address, tokenB.address,
                tokenEmissionA, tokenEmissionB, tokenEmissionA, tokenEmissionB,
                owner.address, deadline
            )
            await tx.wait()
    
            // get LP token
            const tokenLPAddress = await factory.getPair(tokenA.address, tokenB.address)
            const tokenLP = await ethers.getContractAt("IUniswapV2Pair",  tokenLPAddress)
    
            expect(await tokenLP.token0()).to.equal(tokenA.address)
            expect(await tokenLP.token1()).to.equal(tokenB.address)
        })
    })
})