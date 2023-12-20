import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IGlobalState, type IDeployingContractState } from "../deploy";
import { type IState } from "../state/types";
import { type IHandlersMap, type IPlugin, type HookKeys, type HookFn } from "./types";
export declare function handlers(): IHandlersMap;
export declare function registerPlugins(plugins?: IPlugin[]): void;
export declare function registerPlugin(plugin: IPlugin): void;
export declare function hasHook(pluginHookName: HookKeys, hook: HookFn): boolean;
export declare function on(hookName: HookKeys, hre: HardhatRuntimeEnvironment, state?: IState<IGlobalState>, contractState?: IState<IDeployingContractState>): Promise<void>;
