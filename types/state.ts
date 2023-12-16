import { type FactoryOptions } from "@nomicfoundation/hardhat-ethers/types";
import type * as ethers from "ethers";
import {
  type IDeploymentContext,
  type ConstructorArgument,
} from "./deployment";

export interface IGlobalState {
  ctx: IDeploymentContext;
  deployedContracts: string[];
}

export interface IDeployingContractState {
  name: string;
  factoryOptions: FactoryOptions;
  constructorArguments: ConstructorArgument[];
  factory?: ethers.ContractFactory<any[], ethers.Contract>;
}
