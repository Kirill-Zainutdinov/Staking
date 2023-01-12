import { BigNumber } from "ethers"
import { ethers } from "hardhat"

async function main() {
  const router = (await ethers.getContractAt("IUniswapV2Router02",  process.env.ROUTER_ADDRESS as string));
  const factory = (await ethers.getContractAt("IUniswapV2Factory", process.env.FACTORY_ADDRESS as string));
  const ERC20 = await ethers.getContractFactory("ERC20")
  const [owner] = await ethers.getSigners()
  
  // deploy tokenA
  let name = "TokenA"
  let symbol = "TNA"
  let decimals = 18
  let tokenA = await ERC20.deploy(name, symbol, decimals)
  await tokenA.deployed()
  console.log(`TokenA deployed at the address ${tokenA.address}`)
  
  // deploy tokenB
  name = "TokenB"
  symbol = "TNB"
  decimals = 18
  let tokenB = await ERC20.deploy(name, symbol, decimals)
  await tokenB.deployed()
  console.log(`TokenB deployed at the address ${tokenB.address}`)
  
  
  // mint tokenA 
  const tokenEmissionA = BigNumber.from(10).pow(decimals)
  let tx  = await tokenA.mint(owner.address, tokenEmissionA)
  await tx.wait()
  console.log(`TokenA balance is ${await tokenA.balanceOf(owner.address)}`)

  // mint tokenB 
  const tokenEmissionB = BigNumber.from(10).mul(tokenEmissionA)
  tx  = await tokenB.mint(owner.address, tokenEmissionB)
  await tx.wait()
  console.log(`TokenB balance is ${await tokenB.balanceOf(owner.address)}`)

  // allow the router to spend tokens
  tx  = await tokenA.approve(router.address, tokenEmissionA)
  await tx.wait()
  console.log(`Approve tokenA for router contract: ${await tokenA.allowance(owner.address, router.address)}`)
  
  tx  = await tokenB.approve(router.address, tokenEmissionB)
  await tx.wait()
  console.log(`Approve tokenB for router contract: ${await tokenB.allowance(owner.address, router.address)}`)
  
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
  console.log(`TokenLP deployed at the address ${tokenLP.address}`)
  
  // deploy Staking
  const freezingTime = 600
  const percents = 10
  const Staking = await ethers.getContractFactory("Staking")
  let staking = await Staking.deploy(tokenLP.address, tokenA.address, freezingTime, percents)
  await staking.deployed()
  console.log(`Staking deployed at the address ${staking.address}`)

  // set staking contract for tokenA
  tx = await tokenA.setStakingConatract(staking.address)
  await tx.wait()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
