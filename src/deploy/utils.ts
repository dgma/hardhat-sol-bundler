import fs from "fs";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IState } from "../state/types";
import { type IDeploymentConfig, type Lock, type IGlobalState } from "./types";

export const getLock: (lockfileName: string) => Lock = (lockfileName) => {
  if (fs.existsSync(lockfileName)) {
    return JSON.parse(fs.readFileSync(lockfileName, { encoding: "utf8" }));
  }
  return {};
};

export const getDeployment: (
  hre: HardhatRuntimeEnvironment,
) => IDeploymentConfig = (hre) => {
  return (
    hre.userConfig.networks?.[hre.network.name]?.deployment ?? {
      config: {},
    }
  );
};

export const saveDeployment = async (
  hre: HardhatRuntimeEnvironment,
  state: IState<IGlobalState>,
) => {
  const { lockFile } = getDeployment(hre);

  if (lockFile) {
    const lock = getLock(lockFile);

    const newLock = {
      ...lock,
      [hre?.network?.name as string]: {
        ...state?.value().ctx,
      },
    };

    fs.writeFileSync(lockFile, JSON.stringify(newLock, stringifyReplacer));
  }
};

export const arrayClone = <T>(arr: T[] = []) => [...arr];

export const stringifyReplacer = (_: string, value: any) =>
  typeof value === "bigint" ? `${value.toString()}::n` : value;
