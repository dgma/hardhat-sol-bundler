const LockPlugin = require("./Lock");
const PluginsManager = require("../PluginsManager");

const mockGetDeployment = jest.fn(() => ({}));
const mockGetLock = jest.fn();
const mockSave = jest.fn();

jest.mock("../utils", () => ({
  getDeployment: (hre) => mockGetDeployment(hre),
  getLock: (lockfile) => mockGetLock(lockfile),
}));

jest.mock("fs", () => ({
  writeFileSync: (...args) => mockSave(...args),
}));

describe("LockPlugin", () => {
  const hre = {
    network: {
      name: "unit",
    },
  };
  describe(`on ${PluginsManager.Hooks.AFTER_DEPLOYMENT}`, () => {
    const state = {
      value: () => ({ ctx: { Contract: "contract" } }),
    };
    it("should not update lock file if disabled", async () => {
      await LockPlugin[PluginsManager.Hooks.AFTER_DEPLOYMENT](hre, state);
      expect(mockGetLock).not.toBeCalled();
      expect(mockSave).not.toBeCalled();
    });
    it("should update lock file on if enabled", async () => {
      const mockLock = {};
      mockGetLock.mockImplementation(() => mockLock);
      mockGetDeployment.mockImplementation(() => ({
        lockfile: "lockfile",
      }));

      await LockPlugin[PluginsManager.Hooks.AFTER_DEPLOYMENT](hre, state);

      expect(mockGetLock).toBeCalledWith("lockfile");
      expect(mockSave).toBeCalledWith(
        "lockfile",
        JSON.stringify({
          unit: state.value().ctx,
        }),
      );
    });
  });
});
