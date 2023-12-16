import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";

export type ConstructorArgument = number | string | object;

export interface DeploymentContext {
  [name: string]: {
    address: string;
    interface: any[];
    factoryByteCode: string;
    args: ConstructorArgument;
  };
}

export type DynamicConstructorArgument = (
  hre: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
) => ConstructorArgument;

export type DynamicLibrary = (
  HardhatRuntimeEnvironment: HardhatRuntimeEnvironment,
  ctx: DeploymentContext,
) => string;

export interface DeploymentConfig {
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
}