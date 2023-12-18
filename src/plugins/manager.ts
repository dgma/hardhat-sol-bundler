import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IGlobalState, type IDeployingContractState } from "../deploy";
import { type IState } from "../state/types";
import { Hooks } from "./constants";
import {
  type IHandlersMap,
  type IPlugin,
  type HookKeys,
  type HookFn,
} from "./types";

const _hooksList = Object.values(Hooks);

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
  hre: HardhatRuntimeEnvironment,
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
