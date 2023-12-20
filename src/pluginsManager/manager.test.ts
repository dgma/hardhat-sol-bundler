import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks } from "./constants";
import * as PluginsManager from "./manager";

describe("PluginsManager", () => {
  describe("Registration", () => {
    it("should register plugin with hooks only once", () => {
      const fn1 = async () => {};
      const fn2 = async () => {};
      const plugin1 = {
        [Hooks.AFTER_CONTRACT_BUILD]: fn1,
      };
      const plugin2 = {
        [Hooks.AFTER_CONTRACT_BUILD]: fn2,
      };
      PluginsManager.registerPlugins([plugin1, plugin2]);
      PluginsManager.registerPlugins([plugin1, plugin2]);

      expect(PluginsManager.handlers()[Hooks.AFTER_CONTRACT_BUILD].length).toBe(
        2,
      );
    });
  });

  describe("calling", () => {
    const mockHre = {} as HardhatRuntimeEnvironment;
    it("should call subscribed callbacks", async () => {
      const spy = jest.fn();
      const fn1 = async (...args: any[]) => {
        spy(...args);
      };
      const plugin = {
        [Hooks.AFTER_CONTRACT_BUILD]: fn1,
      };
      PluginsManager.registerPlugin(plugin);

      await PluginsManager.on(Hooks.AFTER_CONTRACT_BUILD, mockHre);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockHre, undefined, undefined);
    });
  });
});
