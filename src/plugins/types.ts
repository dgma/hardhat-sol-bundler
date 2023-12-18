import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IGlobalState, type IDeployingContractState } from "../deploy";
import { type IState } from "../state/types";
import { type Hooks } from "./constants";

export type HookKeys = keyof typeof Hooks;
export type HookFn = (
  hre: HardhatRuntimeEnvironment,
  state?: IState<IGlobalState>,
  contractState?: IState<IDeployingContractState>,
) => Promise<void>;

export interface IHandlersMap {
  [Hooks.BEFORE_DEPLOYMENT]: HookFn[];
  [Hooks.BEFORE_CONTRACT_BUILD]: HookFn[];
  [Hooks.BEFORE_CONTRACT_DEPLOY]: HookFn[];
  [Hooks.AFTER_DEPLOYMENT]: HookFn[];
  [Hooks.AFTER_CONTRACT_BUILD]: HookFn[];
  [Hooks.AFTER_CONTRACT_DEPLOY]: HookFn[];
}

export interface IPlugin {
  [Hooks.BEFORE_DEPLOYMENT]?: HookFn;
  [Hooks.BEFORE_CONTRACT_BUILD]?: HookFn;
  [Hooks.BEFORE_CONTRACT_DEPLOY]?: HookFn;
  [Hooks.AFTER_DEPLOYMENT]?: HookFn;
  [Hooks.AFTER_CONTRACT_BUILD]?: HookFn;
  [Hooks.AFTER_CONTRACT_DEPLOY]?: HookFn;
}
