import { type FactoryOptions } from "@nomicfoundation/hardhat-ethers/types";
import type * as ethers from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IPlugin } from "../pluginsManager";
import { SupportedProxies } from "./constants";

export type ConstructorArgument = number | string | object | bigint;

export type ProxyType = keyof typeof SupportedProxies;

export interface ILockContract {
  address?: string;
  interface?: ethers.Interface;
  abi?: ethers.Interface["fragments"];
  factoryByteCode?: string;
  args?: ConstructorArgument[];
  proxy?: ProxyType;
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

export type ProxyUnsafeAllow =
  | "constructor"
  | "delegatecall"
  | "selfdestruct"
  | "state-variable-assignment"
  | "state-variable-immutable"
  | "external-library-linking"
  | "struct-definition"
  | "enum-definition"
  | "missing-public-upgradeto";

export interface IDeploymentConfig {
  lockFile?: string;
  plugins?: IPlugin[];
  verify?: boolean;
  config: {
    [name: string]: {
      contractName?: string;
      proxy?: {
        type: ProxyType;
        unsafeAllow?: ProxyUnsafeAllow[];
      };
      verify?: boolean;
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
  key: string;
  name: string;
  factoryOptions: FactoryOptions;
  constructorArguments: ConstructorArgument[];
  factory?: ethers.ContractFactory<any[], ethers.Contract>;
  contract?: ethers.Contract;
}
