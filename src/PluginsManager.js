const Hooks = {
  BEFORE_DEPLOYMENT: "BEFORE_DEPLOYMENT_INIT",
  BEFORE_CONTRACT_BUILD: "BEFORE_CONTRACT_BUILD",
  BEFORE_CONTRACT_DEPLOY: "BEFORE_CONTRACT_DEPLOY",
  AFTER_DEPLOYMENT: "AFTER_DEPLOYMENT",
  AFTER_CONTRACT_BUILD: "AFTER_CONTRACT_BUILD",
  AFTER_CONTRACT_DEPLOY: "AFTER_CONTRACT_DEPLOY",
};

const _hooksList = Object.values(Hooks);

const _handlers = {};

function handlers() {
  return _handlers;
}

function registerPlugins(plugins = []) {
  plugins.forEach(registerPlugin);
}

function registerPlugin(plugin) {
  _hooksList.forEach((pluginHookName) => {
    const hook = plugin[pluginHookName];
    if (hook && typeof hook === "function") {
      _addHandlersToHook(pluginHookName, hook);
    }
  });
}

function hasHook(pluginHookName, hook) {
  console.log("pluginHookName", pluginHookName);
  console.log("hook", hook);
  return (_handlers[pluginHookName] || []).includes(hook);
}

function _addHandlersToHook(pluginHookName, hook) {
  if (_handlers[pluginHookName] && !hasHook(pluginHookName, hook)) {
    _handlers[pluginHookName].push(hook);
    return;
  }
  _handlers[pluginHookName] = [hook];
}

async function on(hookName, ...args) {
  if (!_handlers[hookName]) {
    return;
  }

  for (const hook of _handlers[hookName]) {
    await hook(...args);
  }
}

module.exports = {
  Hooks,
  handlers,
  registerPlugin,
  registerPlugins,
  hasHook,
  on,
};
