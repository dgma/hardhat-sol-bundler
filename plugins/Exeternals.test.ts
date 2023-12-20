import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IGlobalState, type Externals } from "../src";
import * as stateFabric from "../src/state";
import ExternalsPlugin from "./Externals";

/**
 * Plugin import everything from ./src, so we need to mock hh task module
 */
jest.mock("hardhat/config", () => ({
  ...jest.requireActual("hardhat/config"),
  task: () => ({
    setAction: () => ({}),
  }),
}));

describe("ExternalsPlugin", () => {
  const mockGetContractAt = jest.fn(async () => ({
    interface: {
      fragments: [],
    },
  }));

  const globalState = stateFabric.create<IGlobalState>({
    ctx: {},
    deployedContracts: [],
  });

  const updateSpy = jest.spyOn(globalState, "update");

  const createHre = (externals?: Externals) =>
    ({
      network: {
        name: "unit",
      },
      userConfig: {
        networks: {
          unit: {
            deployment: {
              config: {
                Contract: {},
              },
              externals,
            },
          },
        },
      },
      ethers: {
        getContractAt: mockGetContractAt,
      },
    }) as unknown as HardhatRuntimeEnvironment;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not update context when no externals", async () => {
    const hre = createHre();
    await ExternalsPlugin.BEFORE_CONTRACT_BUILD(hre, globalState);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(globalState.value().ctx).toEqual({});
  });

  it("should put externals to config", async () => {
    const mockExternals = {
      ExternalContract: {
        address: "0xaddress",
      },
    };
    const hre = createHre(mockExternals);
    await ExternalsPlugin.BEFORE_CONTRACT_BUILD(hre, globalState);
    expect(updateSpy).toHaveBeenCalled();
    expect(globalState.value().ctx).toEqual({
      externals: mockExternals,
    });
  });

  it("should put externals with interface when abi provided", async () => {
    const mockExternals = {
      ExternalContract: {
        address: "0xaddress",
        abi: [],
      },
    };
    const hre = createHre(mockExternals);
    await ExternalsPlugin.BEFORE_CONTRACT_BUILD(hre, globalState);
    expect(mockGetContractAt).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
    expect(globalState.value().ctx).toEqual({
      externals: {
        ExternalContract: {
          ...mockExternals.ExternalContract,
          interface: {
            fragments: [],
          },
        },
      },
    });
  });
});
