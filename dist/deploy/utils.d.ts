import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IState } from "../state/types";
import { type IDeploymentConfig, type Lock, type IGlobalState } from "./types";
export declare const getLock: (lockfileName: string) => Lock;
export declare const getDeployment: (hre: HardhatRuntimeEnvironment) => IDeploymentConfig;
export declare const saveDeployment: (hre: HardhatRuntimeEnvironment, state: IState<IGlobalState>) => Promise<void>;
