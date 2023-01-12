import { task } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// Stake function
task("stake", "Staking LPToken")
    .addParam("amount")
    .setAction(async (args, hre) => {

        const owner = (await hre.ethers.getSigners())[0].address;

        const staking = (await hre.ethers.getContractAt("Staking",  "0x544bAbCfB588C2cE1D35C6572DA153d91Af851d3"));
        const tokenLP = (await hre.ethers.getContractAt("IUniswapV2Pair", "0xd821bE074Db59920F81f2494a6F9413a64daab99"));

        let tx = await tokenLP.approve("0x544bAbCfB588C2cE1D35C6572DA153d91Af851d3", args.amount);
        await tx.wait();

        tx = await staking.stake(args.amount);
        await tx.wait();

        const stake = await staking.stakes(owner);

        console.log("You have successfully deposited a stake")
        console.log(`Stake amount: ${stake.tokenAmount} Stake time: ${stake.timeStamp}`)
});

// Claim function
task("claim", "Claim reward")
    .setAction(async (args, hre) => {

        const owner = (await hre.ethers.getSigners())[0].address;

        const staking = (await hre.ethers.getContractAt("Staking", "0x544bAbCfB588C2cE1D35C6572DA153d91Af851d3"));
        const rewardToken = (await hre.ethers.getContractAt("ERC20", "0x8C65cAAaf570f6242864dbfe230674A53cD2D5c4"));

        const balanceBefore = await rewardToken.balanceOf(owner);

        const tx = await staking.claim();
        await tx.wait();
        
        const balanceAfter = await rewardToken.balanceOf(owner);

        console.log(`You have successfully withdrawn an award of ${balanceAfter.sub(balanceBefore)}`)
        console.log(`Your reward token balance is ${balanceAfter}`)
});

// Unstake function
task("unstake", "Stake withdraw")
    .setAction(async (args, hre) => {

        const owner = (await hre.ethers.getSigners())[0].address;

        const staking = (await hre.ethers.getContractAt("Staking", "0x544bAbCfB588C2cE1D35C6572DA153d91Af851d3"));
        const tokenLP = (await hre.ethers.getContractAt("IUniswapV2Pair", "0xd821bE074Db59920F81f2494a6F9413a64daab99"));

        const stake = await staking.stakes(owner);
        
        const tx = await staking.unstake();
        await tx.wait();

        const tokenLPBalance = await tokenLP.balanceOf(owner);

        console.log(`You have successfully withdrawn your stake of ${stake.tokenAmount}`)
        console.log(`Your balance is now ${tokenLPBalance}`)
});
