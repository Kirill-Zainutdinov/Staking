import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { BigNumber } from "ethers"

describe("Testing Staking",  function () {
    
    async function deployContractsAndCreatePair() {
        
        const router = (await ethers.getContractAt("IUniswapV2Router02",  process.env.ROUTER_ADDRESS as string));
        const factory = (await ethers.getContractAt("IUniswapV2Factory", process.env.FACTORY_ADDRESS as string));
        const ERC20 = await ethers.getContractFactory("ERC20")
        const [owner, account, hacker] = await ethers.getSigners()
        
        // deploy tokenA
        let name = "TokenA"
        let symbol = "TNA"
        let decimals = 18
        let tokenA = await ERC20.deploy(name, symbol, decimals)
        await tokenA.deployed()
        
        // deploy tokenB
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
        
        // deploy Staking
        const freezingTime = 600
        const percents = 10
        const Staking = await ethers.getContractFactory("Staking")
        let staking = await Staking.deploy(tokenLP.address, tokenA.address, freezingTime, percents)
        await staking.deployed()

        // set staking contract for tokenA
        tx = await tokenA.setStakingConatract(staking.address)
        await tx.wait()
        
        return { staking, tokenA, tokenLP, freezingTime, percents, owner, hacker }
    }
    
    describe("Deployment", function () {
        it("Check that the owner address is set correctly", async function () {
            const { staking, owner } = await loadFixture(deployContractsAndCreatePair)
            
            expect(await staking.owner()).to.equal(owner.address)
        })
        
        it("Check that the stake token address is set correctly", async function () {
            const { staking, tokenLP } = await loadFixture(deployContractsAndCreatePair)
            
            expect(await staking.stakeTokenAddress()).to.equal(tokenLP.address)
        })
        
        it("Check that the reward token address is set correctly", async function () {
            const { staking, tokenA } = await loadFixture(deployContractsAndCreatePair)
            
            expect(await staking.rewardTokenAddress()).to.equal(tokenA.address)
        })
        
        it("Check that the freezing time is set correctly", async function () {
            const { staking, freezingTime } = await loadFixture(deployContractsAndCreatePair)
            
            expect(await staking.freezingTime()).to.equal(freezingTime)
        })
        
        it("Check that the percents is set correctly", async function () {
            const { staking, percents } = await loadFixture(deployContractsAndCreatePair)
            
            expect(await staking.percents()).to.equal(percents)
        })
    })

    describe("Stake", function () {
        describe("Requires", function () {
            it("Check for approval to transfer the required number of tokens", async function () {
                const { staking, tokenLP, hacker } = await loadFixture(deployContractsAndCreatePair)
    
                const lpTokenAllownce = await tokenLP.allowance(hacker.address, staking.address)

                await expect(
                    staking.connect(hacker).stake(lpTokenAllownce.add(1))
                ).to.be.reverted
            })

            it("Check that there are enough tokens on the balance for the staking", async function () {
                const { staking, tokenLP, hacker } = await loadFixture(deployContractsAndCreatePair)
    
                const lpTokenBalance = await tokenLP.balanceOf(hacker.address)

                // approve for staking contract more token than hacker have 
                const tx = await tokenLP.connect(hacker).approve(staking.address, lpTokenBalance.add(1))
                await tx.wait()

                await expect(
                    staking.connect(hacker).stake(lpTokenBalance.add(1))
                ).to.be.reverted
            })
        })

        describe("Stake", function () {
            it("Check that the balances of accounts in the transfer are changed correctly", async function () {
                const { staking, tokenLP, owner } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                const tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                await expect(staking.stake(ownerBalance))
                .to.changeTokenBalances(
                    tokenLP,
                    [owner.address, staking.address],
                    [ownerBalance.mul(-1), ownerBalance]
                )
            })

            it("Check that the tokenAmount in StakeStruct in stakes mapping set is correctly", async function () {
                const { staking, tokenLP, owner } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                expect((await staking.stakes(owner.address)).tokenAmount).equal(ownerBalance);
            })
        })

        describe("Events", function () {
            it("Check emit an event on Stake", async function () {
                const { staking, tokenLP, owner } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                await expect(staking.stake(ownerBalance))
                .to.emit(staking, "Stake")
                .withArgs(owner.address, anyValue, ownerBalance)
            })
        })
    })

    describe("Claim", function () {
        describe("Requires", function () {
            it("Checking that you can't get reward before the freezingTime has passed", async function () {
                const { staking, tokenLP, owner, freezingTime } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                const blockNumber = await ethers.provider.getBlockNumber();
                const block = await ethers.provider.getBlock(blockNumber);
                const timeStamp = block.timestamp;

                expect(timeStamp).to.lessThan(
                    (await staking.stakes(owner.address)).timeStamp.add(freezingTime)
                )
                await expect(staking.claim())
                .to.be.revertedWith("freezing time has not yet passed")
            })
            
            it("Check that you can't withdraw tokens larger than a stake", async function () {
                const { staking, owner } = await loadFixture(deployContractsAndCreatePair)

                expect((await staking.stakes(owner.address)).tokenAmount).to.equal(0)
                await expect(staking.claim())
                .to.be.revertedWith("You don't have a stake")
            })

            it("Checking that you can't get reward if you don't have it", async function () {
                const { staking, tokenLP, owner, freezingTime } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                // claim
                tx = await staking.claim()
                await tx.wait()

                // claim again
                await expect(staking.claim())
                .to.be.revertedWith("You have no reward available for withdrawal")
            })
        })

        describe("Claim", function () {
            it("Check that when an award is displayed, the number of tokenA changes correctly", async function () {
                const { staking, tokenA, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                // award calculation
                const currentTime = await time.latest()
                const rewardPaid = (await staking.stakes(owner.address)).rewardPaid
                const passedTime = currentTime - stakeTime
                const rewardCount = (passedTime - passedTime % freezingTime) / freezingTime
                const reward = (ownerBalance.sub(ownerBalance.mod(100))).div(100).mul(percents).mul(rewardCount).sub(rewardPaid)

                await expect(staking.claim())
                .to.changeTokenBalances(
                    tokenA,
                    [owner.address],
                    [reward]
                )
            })

            it("Check that when an award is displayed, the value of the received award changes correctly", async function () {
                const { staking, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                // award calculation
                const currentTime = await time.latest()
                const rewardPaid = (await staking.stakes(owner.address)).rewardPaid
                const passedTime = currentTime - stakeTime
                const rewardCount = (passedTime - passedTime % freezingTime) / freezingTime
                const reward = (ownerBalance.sub(ownerBalance.mod(100))).div(100).mul(percents).mul(rewardCount).sub(rewardPaid)

                tx = await staking.claim()
                await tx.wait()

                expect((await staking.stakes(owner.address)).rewardPaid).to.equal(rewardPaid.add(reward))
            })
        })

        describe("Events", function () {
            it("Check emit an event on Claim", async function () {
                const { staking, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)
                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                // award calculation
                const currentTime = await time.latest()
                const rewardPaid = (await staking.stakes(owner.address)).rewardPaid
                const passedTime = currentTime - stakeTime
                const rewardCount = (passedTime - passedTime % freezingTime) / freezingTime
                const reward = (ownerBalance.sub(ownerBalance.mod(100))).div(100).mul(percents).mul(rewardCount).sub(rewardPaid)

                await expect(staking.claim())
                .to.emit(staking, "Claim")
                .withArgs(owner.address, reward)
            })
        })
    })

    describe("Unstake", function () {
        describe("Requires", function () {
            it("Checking that you can't unstake before the freezingTime has passed", async function () {
                const { staking, tokenLP, owner, freezingTime } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                const blockNumber = await ethers.provider.getBlockNumber();
                const block = await ethers.provider.getBlock(blockNumber);
                const timeStamp = block.timestamp;

                expect(timeStamp).to.lessThan(
                    (await staking.stakes(owner.address)).timeStamp.add(freezingTime)
                )
                await expect(staking.unstake())
                .to.be.revertedWith("freezing time has not yet passed")
            })
            
            it("Check that you can't unstake if you don't have stake", async function () {
                const { staking, owner } = await loadFixture(deployContractsAndCreatePair)

                expect((await staking.stakes(owner.address)).tokenAmount).to.equal(0)
                await expect(staking.unstake())
                .to.be.revertedWith("You don't have a stake")
            })
        })

        describe("unstake", function () {
            it("Check that the number of LP tokens changes correctly when the steak is output", async function () {
                const { staking, tokenA, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                await expect(staking.unstake())
                .to.changeTokenBalances(
                    tokenLP,
                    [owner.address],
                    [ownerBalance]
                )
            })

            it("Check that the number of tokenAmount in StakeStruct changes correctly when the steak is output", async function () {
                const { staking, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                tx = await staking.unstake()
                await tx.wait()

                expect((await staking.stakes(owner.address)).tokenAmount).to.equal(0)
            })
        })

        describe("Events", function () {
            it("Check emit an event on Claim", async function () {
                const { staking, tokenLP, owner, freezingTime, percents } = await loadFixture(deployContractsAndCreatePair)

                const ownerBalance = await tokenLP.balanceOf(owner.address)

                // approve for staking contract
                let tx = await tokenLP.approve(staking.address, ownerBalance)
                await tx.wait()

                // time before stake
                const stakeTime = await time.latest()

                // do stake
                tx = await staking.stake(ownerBalance)
                await tx.wait()

                // moving time
                await time.increaseTo((await time.latest()) + freezingTime)

                await expect(staking.unstake())
                .to.emit(staking, "Unstake")
                .withArgs(owner.address, ownerBalance)
            })
        })
    })
})