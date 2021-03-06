/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  BigNumberish,
  Overrides,
} from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Staking, StakingInterface } from "../../Staking.sol/Staking";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_stakeTokenAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_rewardTokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_freezingTime",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_percents",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Claim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Stake",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "Unstake",
    type: "event",
  },
  {
    inputs: [],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "freezingTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "percents",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rewardTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "stakeTokenAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "stakes",
    outputs: [
      {
        internalType: "uint256",
        name: "tokenAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "timeStamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardPaid",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620011293803806200112983398181016040528101906200003791906200013f565b336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555083600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508160038190555080600481905550505050506200021d565b6000815190506200012281620001e9565b92915050565b600081519050620001398162000203565b92915050565b600080600080608085870312156200015657600080fd5b6000620001668782880162000111565b9450506020620001798782880162000111565b93505060406200018c8782880162000128565b92505060606200019f8782880162000128565b91505092959194509250565b6000620001b882620001bf565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b620001f481620001ab565b81146200020057600080fd5b50565b6200020e81620001df565b81146200021a57600080fd5b50565b610efc806200022d6000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c80634e71d92d116100665780634e71d92d146101105780638da5cb5b1461011a578063a694fc3a14610138578063a84fd2ca14610154578063f7dc61b61461017257610093565b80630106395f14610098578063125f9e33146100b657806316934fc4146100d45780632def662014610106575b600080fd5b6100a0610190565b6040516100ad9190610b82565b60405180910390f35b6100be6101b6565b6040516100cb9190610b82565b60405180910390f35b6100ee60048036038101906100e99190610a2c565b6101dc565b6040516100fd93929190610ca1565b60405180910390f35b61010e610206565b005b6101186104c7565b005b610122610872565b60405161012f9190610b82565b60405180910390f35b610152600480360381019061014d9190610a55565b610896565b005b61015c6109f6565b6040516101699190610c5d565b60405180910390f35b61017a6109fc565b6040516101879190610c5d565b60405180910390f35b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60056020528060005260406000206000915090508060000154908060010154908060020154905083565b6000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001541161028b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161028290610c3d565b60405180910390fd5b42600354600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600101546102dc9190610ce9565b1061031c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161031390610bfd565b60405180910390fd5b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb33600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546040518363ffffffff1660e01b81526004016103bb929190610bd4565b600060405180830381600087803b1580156103d557600080fd5b505af11580156103e9573d6000803e3d6000fd5b505050503373ffffffffffffffffffffffffffffffffffffffff167f85082129d87b2fe11527cb1b3b7a520aeb5aa6913f88a3d8757fe40d1db02fdd600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546040516104759190610c5d565b60405180910390a26000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060000181905550565b6000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001541161054c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161054390610c3d565b60405180910390fd5b42600354600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206001015461059d9190610ce9565b106105dd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105d490610bfd565b60405180910390fd5b6000600354600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060010154426106309190610dca565b61063a9190610d3f565b90506000600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020154826004546064600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600001546106d49190610d3f565b6106de9190610d70565b6106e89190610d70565b6106f29190610dca565b90506000811415610738576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161072f90610c1d565b60405180910390fd5b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166340c10f1933836040518363ffffffff1660e01b8152600401610795929190610bd4565b600060405180830381600087803b1580156107af57600080fd5b505af11580156107c3573d6000803e3d6000fd5b5050505080600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060020160008282546108199190610ce9565b925050819055503373ffffffffffffffffffffffffffffffffffffffff167f47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4826040516108669190610c5d565b60405180910390a25050565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b81526004016108f593929190610b9d565b600060405180830381600087803b15801561090f57600080fd5b505af1158015610923573d6000803e3d6000fd5b5050505060405180606001604052808281526020014281526020016000815250600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000820151816000015560208201518160010155604082015181600201559050503373ffffffffffffffffffffffffffffffffffffffff167f5af417134f72a9d41143ace85b0a26dce6f550f894f2cbc1eeee8810603d91b642836040516109eb929190610c78565b60405180910390a250565b60045481565b60035481565b600081359050610a1181610e98565b92915050565b600081359050610a2681610eaf565b92915050565b600060208284031215610a3e57600080fd5b6000610a4c84828501610a02565b91505092915050565b600060208284031215610a6757600080fd5b6000610a7584828501610a17565b91505092915050565b610a8781610dfe565b82525050565b6000610a9a602083610cd8565b91507f667265657a696e672074696d6520686173206e6f7420796574207061737365646000830152602082019050919050565b6000610ada602b83610cd8565b91507f596f752068617665206e6f2072657761726420617661696c61626c6520666f7260008301527f207769746864726177616c0000000000000000000000000000000000000000006020830152604082019050919050565b6000610b40601683610cd8565b91507f596f7520646f6e277420686176652061207374616b65000000000000000000006000830152602082019050919050565b610b7c81610e30565b82525050565b6000602082019050610b976000830184610a7e565b92915050565b6000606082019050610bb26000830186610a7e565b610bbf6020830185610a7e565b610bcc6040830184610b73565b949350505050565b6000604082019050610be96000830185610a7e565b610bf66020830184610b73565b9392505050565b60006020820190508181036000830152610c1681610a8d565b9050919050565b60006020820190508181036000830152610c3681610acd565b9050919050565b60006020820190508181036000830152610c5681610b33565b9050919050565b6000602082019050610c726000830184610b73565b92915050565b6000604082019050610c8d6000830185610b73565b610c9a6020830184610b73565b9392505050565b6000606082019050610cb66000830186610b73565b610cc36020830185610b73565b610cd06040830184610b73565b949350505050565b600082825260208201905092915050565b6000610cf482610e30565b9150610cff83610e30565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115610d3457610d33610e3a565b5b828201905092915050565b6000610d4a82610e30565b9150610d5583610e30565b925082610d6557610d64610e69565b5b828204905092915050565b6000610d7b82610e30565b9150610d8683610e30565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615610dbf57610dbe610e3a565b5b828202905092915050565b6000610dd582610e30565b9150610de083610e30565b925082821015610df357610df2610e3a565b5b828203905092915050565b6000610e0982610e10565b9050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b610ea181610dfe565b8114610eac57600080fd5b50565b610eb881610e30565b8114610ec357600080fd5b5056fea2646970667358221220ba7fd3ccc9bc88d8d8af1c6cc8491d6bd2e8affe548d988bfbf7dd797b178eca64736f6c63430008000033";

type StakingConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StakingConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Staking__factory extends ContractFactory {
  constructor(...args: StakingConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    _stakeTokenAddress: string,
    _rewardTokenAddress: string,
    _freezingTime: BigNumberish,
    _percents: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Staking> {
    return super.deploy(
      _stakeTokenAddress,
      _rewardTokenAddress,
      _freezingTime,
      _percents,
      overrides || {}
    ) as Promise<Staking>;
  }
  override getDeployTransaction(
    _stakeTokenAddress: string,
    _rewardTokenAddress: string,
    _freezingTime: BigNumberish,
    _percents: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _stakeTokenAddress,
      _rewardTokenAddress,
      _freezingTime,
      _percents,
      overrides || {}
    );
  }
  override attach(address: string): Staking {
    return super.attach(address) as Staking;
  }
  override connect(signer: Signer): Staking__factory {
    return super.connect(signer) as Staking__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StakingInterface {
    return new utils.Interface(_abi) as StakingInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Staking {
    return new Contract(address, _abi, signerOrProvider) as Staking;
  }
}
