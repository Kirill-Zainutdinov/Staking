import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20, Staking, IUniswapV2Router02, IUniswapV2Factory, IUniswapV2Pair} from "../typechain"

describe("Staking", function () {

    // контракты
    let tokenA : ERC20;
    let tokenB : ERC20;
    let staking : Staking;
    
    let tokenLP : IUniswapV2Pair;
    let router : IUniswapV2Router02;
    let factory : IUniswapV2Factory;

    // адреса
    let owner : string;

    // прочие
    const freezingTime = 600;
    const percents = 10;
    let tokenLPAmount : BigNumber;
    let stakeTime : number;


    before(async function(){

        owner = (await ethers.getSigners())[0].address;
        const ERC20Factory = await ethers.getContractFactory("ERC20");

        // деплоим TokenA
        let name = "TokenA";
        let symbol = "TNA";
        const decimals = BigNumber.from(3);
        tokenA = await ERC20Factory.deploy(name, symbol, decimals);

        // деплоим TokenB
        name = "TokenB";
        symbol = "TNB";
        tokenB = await ERC20Factory.deploy(name, symbol, decimals);

        // получаем инстансы
        router = (await ethers.getContractAt("IUniswapV2Router02",  process.env.ROUTER_ADDRESS as string));
        factory = (await ethers.getContractAt("IUniswapV2Factory", process.env.FACTORY_ADDRESS as string));
    })


    it("Mint token", async function () {

        // минтим tokenA 
        let value = BigNumber.from(1000000);
        let tx  = await tokenA.mint(owner, value);
        await tx.wait();

        expect(await tokenA.balanceOf(owner)).equal(value);

        // минтим tokenB 
        value = BigNumber.from(100000000);
        tx  = await tokenB.mint(owner, value);
        await tx.wait();

        expect(await tokenB.balanceOf(owner)).equal(value);
    });


    it("Allow the router to spend tokens", async function () {
    
        let value = BigNumber.from(100000);
        let tx  = await tokenA.approve(router.address, value);
        await tx.wait();

        expect(await tokenA.allowance(owner, router.address)).equal(value);

        value = BigNumber.from(1000000);
        tx  = await tokenB.approve(router.address, value);
        await tx.wait();

        expect(await tokenB.allowance(owner, router.address)).equal(value);
    });


    it("addLiquidity", async function () {
    
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        let deadline = block.timestamp + 100;

        let tx = await router.addLiquidity(
            tokenA.address, tokenB.address,
            10000, 100000, 10000, 100000,
            owner, deadline
        );
        await tx.wait()

        const tokenLPAddress = await factory.getPair(tokenA.address, tokenB.address);
        tokenLP = (await ethers.getContractAt("IUniswapV2Pair",  tokenLPAddress));

        expect(await tokenLP.token0()).equal(tokenA.address);
        expect(await tokenLP.token1()).equal(tokenB.address);
    })


    it("Deploying staking contract", async function () {

        const stakingFactory = (await ethers.getContractFactory("Staking"));
        staking = await stakingFactory.deploy(tokenLP.address, tokenA.address, freezingTime, percents);

        expect(await staking.owner()).equal(owner);
    })


    it("setStakingConatract", async function () {

        const tx = await tokenA.setStakingConatract(staking.address);
        await tx.wait();

        expect(await tokenA.stakingContract()).equal(staking.address);
    })


    it("Approve spend from tokenLP to staking", async function () {

        tokenLPAmount = await tokenLP.balanceOf(owner);

        const tx = await tokenLP.approve(staking.address, tokenLPAmount);
        await tx.wait();

        expect(await tokenLP.allowance(owner, staking.address)).equal(tokenLPAmount);
    })


    it("Stake tokenLP", async function () {
        
        const tx = await staking.stake(tokenLPAmount);
        await tx.wait();

        // сохраняем время, когда были застейканы токены
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        stakeTime = block.timestamp;

        expect(await await tokenLP.balanceOf(owner)).equal(0);
        expect((await staking.stakes(owner)).tokenAmount).equal(tokenLPAmount);
    })


    it("Claim revard", async function () {

        // проверяем, что нельзя вывести награду до истечения времени заморозки
        await expect(
            staking.claim()
        ).to.be.revertedWith("freezing time has not yet passed");

        // проверяем, что нельзя вывести stake до истечения времени заморозки
        await expect(
            staking.unstake()
        ).to.be.revertedWith("freezing time has not yet passed");

        // сохраняем баланс tokenA до вывода награды
        let balanceBefore = await tokenA.balanceOf(owner);
        
        // количество "циклов" выплат - можно подставлять сюда разные значения, в том числе дробные
        // и тест не должен при этом падать
        const cycleCount = 3.5;

        // рассчитываем предположительный размер награды
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);
        const time = block.timestamp + cycleCount * freezingTime - stakeTime;
        const rewardCount = (time - time % freezingTime) / freezingTime;
        const stake = await staking.stakes(owner);
        const rewardPaid = (stake.rewardPaid).toNumber();
        const lpTokenAmount = tokenLPAmount.toNumber();
        const reward = (lpTokenAmount - lpTokenAmount % 100) / 100 * percents * rewardCount - rewardPaid;

        // переводим время  вперёд
        await ethers.provider.send('evm_increaseTime', [cycleCount * freezingTime]);

        // выводим награду
        const tx = await staking.claim();
        await tx.wait();
        
        // сохраняем баланс tokenA после вывода награды
        let balanceAfter = await tokenA.balanceOf(owner);

        // проверяем результат
        //console.log(balanceBefore);
        //console.log(reward);
        //console.log(balanceAfter);
        expect(balanceAfter).equal(balanceBefore.toNumber() + reward);

        // пробуем вывести награду ещё раз
        await expect(
            staking.claim()
        ).to.be.revertedWith("You have no reward available for withdrawal");
    })

    // выводим стейк
    it("Unstake", async function () {

        // сохраняем баланс tokenLP до вывода стейка
        let balanceBefore = await tokenLP.balanceOf(owner);
        // сохраняем размер стейка до вывода
        let stakeBefore = (await staking.stakes(owner)).tokenAmount;

        const tx = await staking.unstake();
        await tx.wait();

        // сохраняем баланс tokenLP после вывода награды
        let balanceAfter = await tokenLP.balanceOf(owner);
        // сохраняем размер стейка после вывода
        let stakeAfter = (await staking.stakes(owner)).tokenAmount;

        //console.log(balanceBefore);
        //console.log(balanceAfter);
        //console.log(stakeBefore);
        //console.log(stakeAfter);
        expect(balanceBefore.add(tokenLPAmount)).equal(balanceAfter)
        expect(stakeBefore.sub(tokenLPAmount)).equal(stakeAfter)
        // проверяем, что нельзя вывести награду, после вывода stake
        await expect(
            staking.claim()
        ).to.be.revertedWith("You don't have a stake");
    })
});
