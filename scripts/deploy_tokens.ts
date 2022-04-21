import { ERC20 } from "../typechain";
import { ethers } from "hardhat";

async function main() {

  let erc20 : ERC20;
  let name = "TokenA";
  let symbol = "TNA";
  let decimals = 3;

  const ERC20Factory = (await ethers.getContractFactory("ERC20"));
  
  erc20 = await ERC20Factory.deploy(name, symbol, decimals);
  console.log("Token A deployed to:", erc20.address); 
  // Deployed and Verifyed in Rinkeby 0x8C65cAAaf570f6242864dbfe230674A53cD2D5c4

  name = "TokenB";
  symbol = "TNB";
  decimals = 3;

  erc20 = await ERC20Factory.deploy(name, symbol, decimals);
  console.log("Token B deployed to:", erc20.address);
  // Deployed and Verifyed in Rinkeby 0x146882f852939d2465a42A026f7b34044009f28e
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
// tokenLP 0xd821bE074Db59920F81f2494a6F9413a64daab99
// 1. Одобрено TNA
// 2. Одобрено TNB
// 3. Отправка токенов в пул
// 4. на токенА добавляем адрес контракта стекинга
// 5. на pair апрувываем разраешение брать деньги контракту стейкинга
// 6. на стейкинге делаем стейк
// 7. Выводим награду с контракта стека 0x850a8846efeb245ada7189889dda3ee6a64d8bb0ce431a98e176ed15d404b9c3
// 8. Выводим стейк с контракта стека 0x94cf99980192d981fb2c520747af2996c9b07a87e51596d7cba2cb87788f76aa
