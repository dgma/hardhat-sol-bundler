import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { type IState } from "../state";
import { type IGlobalState, type DeploymentContext } from "./types";
import {
  getDeployment,
  saveDeployment,
  getLock,
  stringifyReplacer,
} from "./utils";

const mockWriteFileSync = jest.fn();
const mockExistsSync = jest.fn();
const mockReadFileSync = jest.fn();

jest.mock("fs", () => ({
  writeFileSync: (file: string, data: string) => mockWriteFileSync(file, data),
  existsSync: (path: string) => mockExistsSync(path),
  readFileSync: (file: string) => mockReadFileSync(file),
}));

describe("getDeployment", () => {
  it("should return deployment with empty config by default", () => {
    const mockHre = {
      network: {
        name: "hardhat",
      },
      userConfig: { networks: {} },
    };
    expect(getDeployment(mockHre as HardhatRuntimeEnvironment).config).toEqual(
      {},
    );
  });

  it("should return deployment for network", () => {
    const hardhatDeploymentMockConfig = {
      SomeContract: {
        args: ["hardhatDeploymentMockConfig"],
      },
    };
    const mockHre = {
      network: {
        name: "unit",
      },
      userConfig: {
        networks: {
          unit: {
            deployment: {
              config: hardhatDeploymentMockConfig,
            },
          },
          random: {
            deployment: {
              config: {
                OtherContract: {},
              },
            },
          },
        },
      } as HardhatRuntimeEnvironment["userConfig"],
    };
    expect(getDeployment(mockHre as HardhatRuntimeEnvironment).config).toEqual(
      hardhatDeploymentMockConfig,
    );
  });
});

describe("getLock", () => {
  it("should sync check if file exists", () => {
    mockExistsSync.mockImplementationOnce(() => false);
    getLock("file.json");
    expect(mockExistsSync).toHaveBeenCalledWith("file.json");
  });

  it("should return default object if no file has been found", () => {
    mockExistsSync.mockImplementationOnce(() => false);
    const lock = getLock("file.json");
    expect(lock).toEqual({});
  });

  it("should sync read file", () => {
    const mockLock = {
      data: "data",
    };
    mockExistsSync.mockImplementationOnce(() => true);
    mockReadFileSync.mockImplementationOnce(() => JSON.stringify(mockLock));
    const lock = getLock("file.json");
    expect(mockReadFileSync).toHaveBeenCalledWith("file.json");
    expect(lock).toEqual(mockLock);
  });
});

describe("saveDeployment", () => {
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

  const createHre = (lockFile?: string) =>
    ({
      network: {
        name: "unit",
      },
      userConfig: {
        networks: {
          unit: {
            deployment: {
              lockFile,
              config: {
                Contract: {},
              },
            },
          },
        },
      } as HardhatRuntimeEnvironment["userConfig"],
    }) as HardhatRuntimeEnvironment;

  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should not update lock file if disabled", async () => {
    await saveDeployment(createHre(), state);
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });
  it("should update lock file on if enabled", async () => {
    mockExistsSync.mockImplementationOnce(() => true);
    mockReadFileSync.mockImplementationOnce(() => JSON.stringify({}));
    await saveDeployment(createHre("lockFile.json"), state);
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      "lockFile.json",
      JSON.stringify({
        unit: state.value().ctx,
      }),
    );
  });
});

describe("stringifyReplacer", () => {
  it("should return properly serialize all values", () => {
    expect(JSON.stringify([1, "1", 1n], stringifyReplacer)).toEqual(
      '[1,"1","1::n"]',
    );
  });
});
