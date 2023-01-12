import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "solidity-coverage"

import "./tasks"

import * as dotenv from "dotenv"
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat:{
      forking:{
        url: "https://eth-goerli.g.alchemy.com/v2/R9QqWMg1ORMnOE9RwIaMwwfNVrgBNN4J",
        blockNumber: 8282294
      }
    },
    // goerli: {
    //   url: process.env.RINKEBY_RPC_URL,
    //   accounts: {
    //     mnemonic: process.env.MNEMONIC
    //   }
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config
