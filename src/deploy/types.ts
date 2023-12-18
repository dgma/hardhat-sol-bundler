import { type FactoryOptions } from "@nomicfoundation/hardhat-ethers/types";
import type * as ethers from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IPlugin } from "../plugins";

export type ConstructorArgument = number | string | object;

export interface ILockContract {
  address?: string;
  interface?: ethers.Interface;
  factoryByteCode?: string;
  args?: ConstructorArgument[];
}

export type DeploymentContext = Record<string, ILockContract>;

export type Lock = Record<string, DeploymentContext>;

export type DynamicConstructorArgument = (
  hre: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
) => ConstructorArgument;

export type DynamicLibrary = (
  HardhatRuntimeEnvironment: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
) => string;

export type Lib = Record<string, string | DynamicLibrary>;

export interface IDeploymentConfig {
  lockFile?: string;
  plugins?: IPlugin[];
  config: {
    [name: string]: {
      args?: (ConstructorArgument | DynamicConstructorArgument)[];
      options?: {
        libs?: Lib;
      };
    };
  };
}

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
