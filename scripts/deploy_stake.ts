import { Staking__factory } from "../typechain";
import { ethers } from "hardhat";

async function main() {

  const stakeTokenAddress = "0xd821bE074Db59920F81f2494a6F9413a64daab99";
  const rewardTokenAddress = "0x8C65cAAaf570f6242864dbfe230674A53cD2D5c4";
  const freezingTime = 600;
  const percents = 10;

  const StakingFactory = (await ethers.getContractFactory("Staking")) as Staking__factory;
  
  let staking = await StakingFactory.deploy(stakeTokenAddress, rewardTokenAddress, freezingTime, percents);

  console.log("Stake deployed to:", staking.address);
  // Deployed and Verifyed in Rinkeby 0x544bAbCfB588C2cE1D35C6572DA153d91Af851d3
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
