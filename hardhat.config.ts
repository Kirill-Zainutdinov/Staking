import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import '@nomiclabs/hardhat-ethers'
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();

import "./tasks"

const config: HardhatUserConfig = {
  solidity: "0.8.0",
  networks: {
    hardhat:{
      forking:{
        url: "https://eth-mainnet.alchemyapi.io/v2/rxL1SXagOnLaNqebQnneAWsY2sm7f-jK",
        blockNumber: 10539197 
      }
    },
    rinkeby: {
      url: process.env.RINKEBY_RPC_URL,
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
