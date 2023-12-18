import { type FactoryOptions } from "@nomicfoundation/hardhat-ethers/types";
import type * as ethers from "ethers";
import {
  type DeploymentContext,
  type ConstructorArgument,
  type ILockContract,
} from "./deployment";

export interface IGlobalState {
  ctx: DeploymentContext;
  deployedContracts: string[];
}

export interface IDeployingContractState extends ILockContract {
  name: string;
  factoryOptions: FactoryOptions;
  constructorArguments: ConstructorArgument[];
  factory?: ethers.ContractFactory<any[], ethers.Contract>;
  contract?: ethers.Contract;
}
