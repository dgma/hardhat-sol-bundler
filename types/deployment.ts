import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export type ConstructorArgument = number | string | object;

export interface ILockContract {
  address: string;
  interface: any[];
  factoryByteCode: string;
  args: ConstructorArgument[];
}

export interface ILock {
  [network: string]: {
    [contractName: string]: ILockContract;
  };
}

export interface IDeploymentContext {
  [name: string]: ILockContract;
}

export type DynamicConstructorArgument = (
  hre: HardhatRuntimeEnvironment,
  ctx: IDeploymentContext,
) => ConstructorArgument;

export type DynamicLibrary = (
  HardhatRuntimeEnvironment: HardhatRuntimeEnvironment,
  ctx: IDeploymentContext,
) => string;

export interface IDeploymentConfig {
  logFile?: string;
  config: {
    [name: string]:
      | {
          args?: (ConstructorArgument | DynamicConstructorArgument)[];
          options?: {
            libs?: {
              [name: string]: string | DynamicLibrary;
            };
          };
        }
      | {};
  };
}
