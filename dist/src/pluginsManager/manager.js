"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.on = exports.hasHook = exports.registerPlugin = exports.registerPlugins = exports.handlers = void 0;
const constants_1 = require("./constants");
const _hooksList = Object.values(constants_1.Hooks);
const _handlers = {
    [constants_1.Hooks.BEFORE_CONTEXT_INITIALIZATION]: [],
    [constants_1.Hooks.BEFORE_DEPLOYMENT]: [],
    [constants_1.Hooks.BEFORE_DEPENDENCY_RESOLUTION]: [],
    [constants_1.Hooks.BEFORE_CONTRACT_BUILD]: [],
    [constants_1.Hooks.BEFORE_CONTRACT_DEPLOY]: [],
    [constants_1.Hooks.AFTER_DEPLOYMENT]: [],
    [constants_1.Hooks.AFTER_CONTRACT_BUILD]: [],
    [constants_1.Hooks.AFTER_CONTEXT_SERIALIZATION]: [],
    [constants_1.Hooks.AFTER_CONTRACT_DEPLOY]: [],
};
function handlers() {
    return _handlers;
}
exports.handlers = handlers;
function registerPlugins(plugins = []) {
    plugins.forEach(registerPlugin);
}
exports.registerPlugins = registerPlugins;
function registerPlugin(plugin) {
    _hooksList.forEach((pluginHookName) => {
        const hook = plugin[pluginHookName];
        if (hook && typeof hook === "function") {
            _addHandlersToHook(pluginHookName, hook);
        }
    });
}
exports.registerPlugin = registerPlugin;
function hasHook(pluginHookName, hook) {
    return (_handlers[pluginHookName] || []).includes(hook);
}
exports.hasHook = hasHook;
function _addHandlersToHook(pluginHookName, hook) {
    if (_handlers[pluginHookName] && !hasHook(pluginHookName, hook)) {
        _handlers[pluginHookName].push(hook);
        return;
    }
    _handlers[pluginHookName] = [hook];
}
async function on(hookName, hre, state, contractState) {
    if (!_handlers[hookName]) {
        return;
    }
    for (const hook of _handlers[hookName]) {
        await hook(hre, state, contractState);
    }
}
exports.on = on;
