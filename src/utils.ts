import fs from "fs";
import {
  type HardhatNetworkUserConfig,
  type HttpNetworkUserConfig,
} from "hardhat/types/config";
import { type IDeploymentConfig, type Lock } from "../types/deployment";

export const I: <T>(val: T) => T = (val) => val;

type ComposeFromEntires = <T>(
  entries: [string, any][] | undefined,
  valueMapper?: (val: any) => T,
) => { [key: string]: T };

export const composeFromEntires: ComposeFromEntires = (
  entries = Object.entries({}),
  valueMapper = I,
) =>
  entries.reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]: valueMapper(value),
    }),
    {},
  );

export const getLock: (lockfileName: string) => Lock = (lockfileName) => {
  if (fs.existsSync(lockfileName)) {
    return JSON.parse(fs.readFileSync(lockfileName, { encoding: "utf8" }));
  }
  return {};
};

export interface ILimitedHardhatRuntimeEnvironment {
  network: {
    name: string;
  };
  userConfig: {
    networks?: {
      [network: string]:
        | HardhatNetworkUserConfig
        | HttpNetworkUserConfig
        | undefined;
    };
  };
}

export const getDeployment: (
  hre: ILimitedHardhatRuntimeEnvironment,
) => IDeploymentConfig = (hre) => {
  return (
    hre.userConfig.networks?.[hre.network.name]?.deployment ?? {
      config: {},
    }
  );
};
