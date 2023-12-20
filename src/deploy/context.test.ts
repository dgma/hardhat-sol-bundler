import type * as ethers from "ethers";
import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import * as stateFabric from "../state";
import { init, serialize, resolveDeps } from "./context";
import {
  type DeploymentContext,
  type IDeploymentConfig,
  type IDeployingContractState,
  type IGlobalState,
} from "./types";

const mockGetDeployment = jest.fn(() => ({}));
const mockGetLock = jest.fn();

jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),
  getDeployment: () => mockGetDeployment(),
  getLock: (lockfile: string) => mockGetLock(lockfile),
}));

describe("context", () => {
  const hre = {
    network: {
      name: "unit",
    },
  } as HardhatRuntimeEnvironment;
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("init", () => {
    mockGetDeployment.mockImplementation(() => ({
      config: {
        Contract: {},
      },
      lockFile: "lockFile",
    }));

    mockGetLock.mockImplementation(() => ({
      unit: {
        Contract: {
          address: "0xaddress",
        },
      },
    }));

    it("should create proper context", async () => {
      const state = stateFabric.create({
        ctx: {} as DeploymentContext,
        deployedContracts: [""],
      });

      const extendedMockHre: unknown = {
        ...hre,
        ethers: {
          getContractAt: async () => ({
            interface: {
              fragments: [] as ethers.Interface["fragments"],
            } as ethers.Interface,
          }),
        },
      };

      await init(extendedMockHre as HardhatRuntimeEnvironment, state);
      expect(state.value().ctx).toEqual({
        Contract: {
          address: "0xaddress",
          interface: {
            fragments: [],
          },
        },
      });
    });
  });

  describe("resolveDeps", () => {
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
      await resolveDeps(hre, state, contractState);
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

  describe("serialize", () => {
    it("should update context", async () => {
      const state = stateFabric.create({} as IGlobalState);
      const expectedContractState = {
        address: "0xaddress",
        abi: [] as ethers.Interface["fragments"],
        factoryByteCode: "bytecode",
        args: [1, 2, 3],
      };
      const contractState = stateFabric.create({
        contract: {
          getAddress: async () => expectedContractState.address,
          interface: {
            fragments: expectedContractState.abi,
          },
        },
        factory: {
          bytecode: expectedContractState.factoryByteCode,
        },
        constructorArguments: expectedContractState.args,
        name: "ContractName",
      } as IDeployingContractState);
      await serialize(hre, state, contractState);

      expect(state.value().ctx).toEqual({
        ContractName: expectedContractState,
      });
    });
  });
});
