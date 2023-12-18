import type * as ethers from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";

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
  config: {
    [name: string]:
      | {
          args?: (ConstructorArgument | DynamicConstructorArgument)[];
          options?: {
            libs?: Lib;
          };
        }
      | {};
  };
}
