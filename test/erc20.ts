import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ERC20, ERC20__factory } from "../typechain";

// Тест контракта токена
// Практически не претерпел изменений с прошлого задания

describe("Testing ERC20",  function () {

  let erc20 : ERC20;
  let signers : SignerWithAddress[];

  const name = "KirillZaynutdinovToken";
  const symbol = "KZT";
  const decimals = BigNumber.from(3);

  before(async function(){
    signers = await ethers.getSigners();

    const ERC20Factory = (await ethers.getContractFactory("ERC20"));
    erc20 = await ERC20Factory.deploy(name, symbol, decimals);
  })


  it("check name()", async function(){
    expect(await erc20.name()).equal(name);
  })


  it("check symbol()", async function(){
    expect(await erc20.symbol()).equal(symbol);
  })


  it("check decimals()", async function(){
    expect(await erc20.decimals()).equal(decimals);
  })


  it("check mint(), balanceOf() and totalSupply()", async function () {

    const value = BigNumber.from(10000);

    const balanceBefore = await erc20.balanceOf(signers[1].address);
    const totalSupplyBefore = await erc20.totalSupply();

    let tx  = await erc20.mint(signers[1].address, value);
    await tx.wait();

    const balanceAfter = await erc20.balanceOf(signers[1].address);
    const totalSupplyAfter = await erc20.totalSupply();

    expect(await balanceBefore.add(value)).equal(balanceAfter);
    expect(await totalSupplyBefore.add(value)).equal(totalSupplyAfter);

    await expect(
      erc20.connect(signers[1]).mint(signers[1].address, value)
    ).to.be.revertedWith("You are not owner");
  });


  it("check burn(), balanceOf() and totalSupply()", async function () {
    
    let value = BigNumber.from(5000);

    const balanceBefore = await erc20.balanceOf(signers[1].address);
    const totalSupplyBefore = await erc20.totalSupply();

    let tx  = await erc20.connect(signers[1]).burn(value);
    await tx.wait();

    const balanceAfter = await erc20.balanceOf(signers[1].address);
    const totalSupplyAfter = await erc20.totalSupply();

    expect(await balanceBefore.sub(value)).equal(balanceAfter);
    expect(await totalSupplyBefore.sub(value)).equal(totalSupplyAfter);

    value = BigNumber.from(15000);
    await expect(
        erc20.connect(signers[1]).burn(value)
    ).to.be.revertedWith("not enough tokens");
  });


  it("check approve() and allowance()", async function () {
    
    const value = BigNumber.from(2500);

    const allowedBefore = await erc20.allowance(signers[1].address, signers[2].address);

    let tx  = await erc20.connect(signers[1]).approve(signers[2].address, value);
    await tx.wait();

    const allowedAfter = await erc20.allowance(signers[1].address, signers[2].address);

    expect(await allowedBefore.add(value)).equal(allowedAfter);
  });

  it("check transfer()", async function () {
    
    const value = BigNumber.from(3000);

    const senderBalanceBefore = await erc20.balanceOf(signers[1].address);
    const recipientBalanceBefore = await erc20.balanceOf(signers[2].address);

    let tx  = await erc20.connect(signers[1]).transfer(signers[2].address, value);
    await tx.wait();

    const senderBalanceAfter = await erc20.balanceOf(signers[1].address);
    const recipientBalanceAfter = await erc20.balanceOf(signers[2].address);

    expect(await senderBalanceBefore.sub(value)).equal(senderBalanceAfter);
    expect(await recipientBalanceBefore.add(value)).equal(recipientBalanceAfter);
    await expect(
      erc20.connect(signers[1]).transfer(signers[2].address, value)
    ).to.be.revertedWith("not enough tokens");
  });

  it("check transferFrom()", async function () {
    
    let value = BigNumber.from(1500);

    const senderBalanceBefore = await erc20.balanceOf(signers[1].address);
    const recipientBalanceBefore = await erc20.balanceOf(signers[3].address);
    const allowedBefore = await erc20.allowance(signers[1].address, signers[2].address);

    let tx  = await erc20.connect(signers[2]).transferFrom(signers[1].address, signers[3].address, value);
    await tx.wait();

    const senderBalanceAfter = await erc20.balanceOf(signers[1].address);
    const recipientBalanceAfter = await erc20.balanceOf(signers[3].address);
    const allowedAfter = await erc20.allowance(signers[1].address, signers[2].address);

    expect(await senderBalanceBefore.sub(value)).equal(senderBalanceAfter);
    expect(await recipientBalanceBefore.add(value)).equal(recipientBalanceAfter);
    expect(await allowedBefore.sub(value)).equal(allowedAfter);

    await expect(
      erc20.connect(signers[2]).transferFrom(signers[1].address, signers[3].address, value)
    ).to.be.revertedWith("no permission to spend");

    value = BigNumber.from(1000);
    await expect(
      erc20.connect(signers[2]).transferFrom(signers[1].address, signers[3].address, value)
    ).to.be.revertedWith("not enough tokens");
  });
});
