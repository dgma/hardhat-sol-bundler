import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IState } from "../state/types";
import { type IGlobalState, type IDeployingContractState } from "./types";
export type ContextManipulator = (hre: HardhatRuntimeEnvironment, state?: IState<IGlobalState>, contractState?: IState<IDeployingContractState>) => Promise<void>;
export declare const init: ContextManipulator;
export declare const serialize: ContextManipulator;
export declare const resolveDeps: ContextManipulator;
