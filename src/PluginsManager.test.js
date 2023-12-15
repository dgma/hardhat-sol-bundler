const PluginsManager = require("./PluginsManager");

describe("PluginsManager", () => {
  it("should return Hooks object", () => {
    expect(Object.keys(PluginsManager.Hooks)).toEqual([
      "BEFORE_DEPLOYMENT",
      "BEFORE_CONTRACT_BUILD",
      "BEFORE_CONTRACT_DEPLOY",
      "AFTER_DEPLOYMENT",
      "AFTER_CONTRACT_BUILD",
      "AFTER_CONTRACT_DEPLOY",
    ]);
  });

  describe("Registration", () => {
    it("should register plugin with hooks only once", () => {
      const fn1 = () => {};
      const fn2 = () => {};
      const plugin1 = {
        [PluginsManager.Hooks.AFTER_CONTRACT_BUILD]: fn1,
      };
      const plugin2 = {
        [PluginsManager.Hooks.AFTER_CONTRACT_BUILD]: fn2,
      };
      PluginsManager.registerPlugins([plugin1, plugin2]);
      PluginsManager.registerPlugins([plugin1, plugin2]);

      expect(
        PluginsManager.handlers()[PluginsManager.Hooks.AFTER_CONTRACT_BUILD]
          .length
      ).toBe(2);
    });
  });

  describe("calling", () => {
    it("should call subscribed callbacks", async () => {
      const spy = jest.fn();
      const fn1 = async (...args) => {
        spy(...args);
      };
      const plugin = {
        [PluginsManager.Hooks.AFTER_CONTRACT_BUILD]: fn1,
      };
      PluginsManager.registerPlugin(plugin);

      await PluginsManager.on(
        PluginsManager.Hooks.AFTER_CONTRACT_BUILD,
        "hello"
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith("hello");
    });
  });
});
