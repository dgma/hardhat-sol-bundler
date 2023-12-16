import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import {
  type IGlobalState,
  type IDeployingContractState,
} from "../types/state";
import { type IState } from "./stateFabric";

export const Hooks = {
  BEFORE_DEPLOYMENT: "BEFORE_DEPLOYMENT",
  BEFORE_CONTRACT_BUILD: "BEFORE_CONTRACT_BUILD",
  BEFORE_CONTRACT_DEPLOY: "BEFORE_CONTRACT_DEPLOY",
  AFTER_DEPLOYMENT: "AFTER_DEPLOYMENT",
  AFTER_CONTRACT_BUILD: "AFTER_CONTRACT_BUILD",
  AFTER_CONTRACT_DEPLOY: "AFTER_CONTRACT_DEPLOY",
} as const;

const _hooksList = Object.values(Hooks);

export type HookKeys = keyof typeof Hooks;
type HookFn = (
  hre: Partial<HardhatRuntimeEnvironment>,
  state?: IState<IGlobalState>,
  contractState?: IState<IDeployingContractState>,
) => void;
interface IHandlersMap {
  [Hooks.BEFORE_DEPLOYMENT]: HookFn[];
  [Hooks.BEFORE_CONTRACT_BUILD]: HookFn[];
  [Hooks.BEFORE_CONTRACT_DEPLOY]: HookFn[];
  [Hooks.AFTER_DEPLOYMENT]: HookFn[];
  [Hooks.AFTER_CONTRACT_BUILD]: HookFn[];
  [Hooks.AFTER_CONTRACT_DEPLOY]: HookFn[];
}

export interface IPlugin {
  [Hooks.BEFORE_DEPLOYMENT]?: () => void;
  [Hooks.BEFORE_CONTRACT_BUILD]?: () => void;
  [Hooks.BEFORE_CONTRACT_DEPLOY]?: () => void;
  [Hooks.AFTER_DEPLOYMENT]?: () => void;
  [Hooks.AFTER_CONTRACT_BUILD]?: () => void;
  [Hooks.AFTER_CONTRACT_DEPLOY]?: () => void;
}

const _handlers: IHandlersMap = {
  [Hooks.BEFORE_DEPLOYMENT]: [],
  [Hooks.BEFORE_CONTRACT_BUILD]: [],
  [Hooks.BEFORE_CONTRACT_DEPLOY]: [],
  [Hooks.AFTER_DEPLOYMENT]: [],
  [Hooks.AFTER_CONTRACT_BUILD]: [],
  [Hooks.AFTER_CONTRACT_DEPLOY]: [],
};

export function handlers() {
  return _handlers;
}

export function registerPlugins(plugins: IPlugin[] = []) {
  plugins.forEach(registerPlugin);
}

export function registerPlugin(plugin: IPlugin) {
  _hooksList.forEach((pluginHookName) => {
    const hook = plugin[pluginHookName];
    if (hook && typeof hook === "function") {
      _addHandlersToHook(pluginHookName, hook);
    }
  });
}

export function hasHook(pluginHookName: HookKeys, hook: HookFn) {
  return (_handlers[pluginHookName] || []).includes(hook);
}

function _addHandlersToHook(pluginHookName: HookKeys, hook: HookFn) {
  if (_handlers[pluginHookName] && !hasHook(pluginHookName, hook)) {
    _handlers[pluginHookName].push(hook);
    return;
  }
  _handlers[pluginHookName] = [hook];
}

export async function on(
  hookName: HookKeys,
  hre: Partial<HardhatRuntimeEnvironment>,
  state?: IState<IGlobalState>,
  contractState?: IState<IDeployingContractState>,
) {
  if (!_handlers[hookName]) {
    return;
  }

  for (const hook of _handlers[hookName]) {
    await hook(hre, state, contractState);
  }
}
