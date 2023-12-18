import type * as ethers from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import * as PluginsManager from "../PluginsManager";
import * as stateFabric from "../stateFabric";
import {
  type DeploymentContext,
  type IDeploymentConfig,
} from "../declarations/deployment";
import { IDeployingContractState, IGlobalState } from "../declarations/state";
import { default as ContextPlugin } from "./Context";

const mockGetDeployment = jest.fn(() => ({}));
const mockGetLock = jest.fn();

jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  getDeployment: () => mockGetDeployment(),
  getLock: (lockfile: string) => mockGetLock(lockfile),
}));

describe("ContextPlugin", () => {
  const hre = {
    network: {
      name: "unit",
    },
  } as HardhatRuntimeEnvironment;
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
      const state = stateFabric.create({
        ctx: {} as DeploymentContext,
        deployedContracts: [""],
      });

      const extendedMockHre: unknown = {
        ...hre,
        ethers: {
          getContractAt: async () => ({
            interface: {} as ethers.Interface,
          }),
        },
      };

      await ContextPlugin[PluginsManager.Hooks.BEFORE_DEPLOYMENT](
        extendedMockHre as HardhatRuntimeEnvironment,
        state,
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
      const config: IDeploymentConfig["config"] = {
        Lib: {},
        Contract1: {
          args: ["hello"],
        },
        Contract2: {
          args: ["world", (_, ctx) => ctx.Contract1.address],
          options: {
            libs: {
              Lib: (_, ctx) => ctx.Lib.address as string,
            },
          },
        },
      };
      mockGetDeployment.mockImplementation(() => ({
        config,
      }));
    });
    it("should resolve dependencies", async () => {
      const state = stateFabric.create({
        ctx: {
          Lib: {
            address: "0xlib_address",
            interface: {} as ethers.Interface,
            factoryByteCode: "lib_bytecode",
            args: [""],
          },
          Contract1: {
            address: "0xcontract1_address",
            interface: {} as ethers.Interface,
            factoryByteCode: "contract1_bytecode",
            args: ["hello"],
          },
        } as DeploymentContext,
        deployedContracts: [""],
      });
      const contractState = stateFabric.create({
        name: "Contract2",
      } as IDeployingContractState);
      await ContextPlugin[PluginsManager.Hooks.BEFORE_CONTRACT_BUILD](
        hre,
        state,
        contractState,
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
      const state = stateFabric.create({} as IGlobalState);
      const expectedContractState = {
        address: "0xaddress",
        interface: {} as ethers.Interface,
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
      } as IDeployingContractState);
      await ContextPlugin[PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY](
        hre,
        state,
        contractState,
      );

      expect(state.value().ctx).toEqual({
        ContractName: expectedContractState,
      });
    });
  });
});
