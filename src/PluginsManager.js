const Hooks = {
  BEFORE_DEPLOYMENT: "BEFORE_DEPLOYMENT_INIT",
  BEFORE_CONTRACT_BUILD: "BEFORE_CONTRACT_BUILD",
  BEFORE_CONTRACT_DEPLOY: "BEFORE_CONTRACT_DEPLOY",
  AFTER_DEPLOYMENT: "AFTER_DEPLOYMENT",
  AFTER_CONTRACT_BUILD: "AFTER_CONTRACT_BUILD",
  AFTER_CONTRACT_DEPLOY: "AFTER_CONTRACT_DEPLOY",
};

const HooksList = Object.values(Hooks);

class PluginsManager {
  Hooks = Hooks;

  constructor() {
    this.handlers = {};
  }

  registerPlugins(plugins = []) {
    plugins.forEach((plugin) => this._registerPlugin(plugin));
  }

  _registerPlugin(plugin) {
    HooksList.forEach((pluginHookName) => {
      const hook = plugin[pluginHookName];
      if (hook && typeof hook === "function") {
        this._addHandlersToHook(pluginHookName, hook);
      }
      return this;
    });
  }

  _addHandlersToHook(pluginHookName, hook) {
    if (this.handlers[pluginHookName]) {
      this.handlers[pluginHookName].push(hook);
      return this;
    }
    this.handlers[pluginHookName] = [hook];
    return this;
  }

  async on(hookName, ...args) {
    if (!this.handlers[hookName]) {
      return this;
    }

    for (const hook of this.handlers[hookName]) {
      await hook(...args);
    }
    return this;
  }
}

module.exports = new PluginsManager();
