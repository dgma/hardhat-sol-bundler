import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import * as PluginsManager from "../PluginsManager";
import { type IState } from "../stateFabric";
import { type DeploymentContext } from "../declarations/deployment";
import { type IGlobalState } from "../declarations/state";
import { default as LockPlugin } from "./Lock";

const mockGetDeployment = jest.fn(() => ({}));
const mockGetLock = jest.fn();
const mockSave = jest.fn();

jest.mock("../utils", () => ({
  getDeployment: () => mockGetDeployment(),
  getLock: (lockfile: string) => mockGetLock(lockfile),
}));

jest.mock("fs", () => ({
  writeFileSync: (file: string, data: string) => mockSave(file, data),
}));

describe("LockPlugin", () => {
  const hre = {
    network: {
      name: "unit",
    },
    userConfig: {},
  } as HardhatRuntimeEnvironment;
  describe(`on ${PluginsManager.Hooks.AFTER_DEPLOYMENT}`, () => {
    const Contract = {
      address: "0xcontract",
      interface: [],
      factoryByteCode: "ContractFactoryByteCode",
      args: [],
    } as DeploymentContext;
    const state = {
      value: () => ({
        ctx: {
          Contract,
        },
        deployedContracts: [],
      }),
      update: () => {},
    } as IState<IGlobalState>;
    it("should not update lock file if disabled", async () => {
      await LockPlugin[PluginsManager.Hooks.AFTER_DEPLOYMENT](hre, state);
      expect(mockGetLock).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
    });
    it("should update lock file on if enabled", async () => {
      const mockLock = {};
      mockGetLock.mockImplementation(() => mockLock);
      mockGetDeployment.mockImplementation(() => ({
        lockfile: "lockfile",
      }));

      await LockPlugin[PluginsManager.Hooks.AFTER_DEPLOYMENT](hre, state);

      expect(mockGetLock).toHaveBeenCalledWith("lockfile");
      expect(mockSave).toHaveBeenCalledWith(
        "lockfile",
        JSON.stringify({
          unit: state.value().ctx,
        }),
      );
    });
  });
});
