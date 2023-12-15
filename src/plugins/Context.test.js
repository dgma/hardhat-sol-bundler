const ContextPlugin = require("./Context");
const PluginsManager = require("../PluginsManager");
const stateFabric = require("../stateFabric");

const mockGetDeployment = jest.fn(() => ({}));
const mockGetLock = jest.fn();

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getDeployment: (hre) => mockGetDeployment(hre),
  getLock: (lockfile) => mockGetLock(lockfile),
}));

describe("ContextPlugin", () => {
  const hre = {
    network: {
      name: "unit",
    },
  };
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe(`on ${PluginsManager.Hooks.BEFORE_DEPLOYMENT}`, () => {
    beforeEach(() => {
      mockGetDeployment.mockImplementation(() => ({
        config: {
          Contract: {},
        },
        lockfile: "lockfile",
      }));

      mockGetLock.mockImplementation(() => ({
        unit: {
          Contract: {
            address: "0xaddress",
          },
        },
      }));
    });

    it("should create proper context", async () => {
      const state = stateFabric.create({});
      await ContextPlugin[PluginsManager.Hooks.BEFORE_DEPLOYMENT](
        {
          ...hre,
          ethers: {
            getContractAt: () => ({ interface: "interface" }),
          },
        },
        state
      );
      expect(state.value().ctx).toEqual({
        Contract: {
          address: "0xaddress",
          interface: "interface",
        },
      });
    });
  });

  describe(`on ${PluginsManager.Hooks.BEFORE_CONTRACT_BUILD}`, () => {
    beforeEach(() => {
      mockGetDeployment.mockImplementation(() => ({
        config: {
          Lib: {},
          Contract1: {
            args: "hello",
          },
          Contract2: {
            args: ["world", (_, ctx) => ctx.Contract1.address],
            options: {
              libs: {
                Lib: (_, ctx) => ctx.Lib.address,
              },
            },
          },
        },
      }));
    });
    it("should resolve dependencies", async () => {
      const state = stateFabric.create({
        ctx: {
          Lib: {
            address: "0xlib_address",
            interface: "lib_interface",
            factoryByteCode: "lib_bytecode",
            args: [],
          },
          Contract1: {
            address: "0xcontract1_address",
            interface: "contract1_interface",
            factoryByteCode: "contract1_bytecode",
            args: ["hello"],
          },
        },
      });
      const contractState = stateFabric.create({
        name: "Contract2",
      });
      await ContextPlugin[PluginsManager.Hooks.BEFORE_CONTRACT_BUILD](
        hre,
        state,
        contractState
      );
      expect(contractState.value()).toEqual({
        name: "Contract2",
        factoryOptions: {
          libraries: {
            Lib: "0xlib_address",
          },
        },
        constructorArguments: ["world", "0xcontract1_address"],
      });
    });
  });

  describe(`on ${PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY}`, () => {
    it("should update context", async () => {
      const state = stateFabric.create({});
      const expectedContractState = {
        address: "0xaddress",
        interface: "interface",
        factoryByteCode: "bytecode",
        args: [1, 2, 3],
      };
      const contractState = stateFabric.create({
        contract: {
          getAddress: async () => expectedContractState.address,
          interface: expectedContractState.interface,
        },
        factory: {
          bytecode: expectedContractState.factoryByteCode,
        },
        constructorArguments: expectedContractState.args,
        name: "ContractName",
      });
      await ContextPlugin[PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY](
        hre,
        state,
        contractState
      );

      expect(state.value().ctx).toEqual({
        ContractName: expectedContractState,
      });
    });
  });
});
