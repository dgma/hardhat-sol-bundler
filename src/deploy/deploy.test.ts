import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks, type HookKeys } from "../plugins";
import { type IState } from "../state";
import { default as deploy } from "./deploy";
import {
  type IGlobalState,
  type IDeployingContractState,
  type ConstructorArgument,
} from "./types";

const mockGetDeployment = jest.fn();
const mockOn = jest.fn();
const mockCreate = jest.fn();

jest.mock("../state", () => ({
  create: () => mockCreate(),
}));

jest.mock("./utils", () => ({
  getDeployment: () => mockGetDeployment(),
}));
jest.mock("../plugins", () => ({
  ...jest.requireActual("../plugins"),
  PluginsManager: {
    on: async (
      hookName: HookKeys,
      hre: Partial<HardhatRuntimeEnvironment>,
      state?: IState<IGlobalState>,
      contractState?: IState<IDeployingContractState>,
    ) => mockOn(hookName, hre, state, contractState),
  },
}));

describe("deploy", () => {
  const mockUpdateState = jest.fn();
  const mockUpdateContractState = jest.fn();
  const mockWaitForDeployment = jest.fn();
  const mockContractDeploy = jest.fn(() => ({
    waitForDeployment: mockWaitForDeployment,
  }));
  const mockGetContractFactory = jest.fn(() => ({
    bytecode: "bytecode",
    deploy: mockContractDeploy,
  }));

  mockGetDeployment.mockImplementation(() => ({
    config: {
      ContractName: {},
    },
  }));

  const hre = {
    ethers: {
      getContractFactory: mockGetContractFactory,
    },
  } as any;
  const name = "ContractName";
  const factoryOptions = {};
  const constructorArguments: ConstructorArgument[] = [];

  const state = {
    value: () => ({
      ctx: {},
      deployedContracts: [],
    }),
    update: mockUpdateState,
  };
  const contractState = {
    value: () => ({
      name,
      factoryOptions,
      constructorArguments,
      factory: {
        bytecode: "bytecode",
        deploy: mockContractDeploy,
      },
    }),
    update: mockUpdateContractState,
  };

  beforeEach(async () => {
    mockCreate
      .mockImplementationOnce(() => state)
      .mockImplementationOnce(() => contractState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not run for empty config", async () => {
    mockGetDeployment.mockImplementationOnce(() => ({ config: {} }));

    await deploy(hre);

    expect(mockGetContractFactory).not.toHaveBeenCalled();
  });

  it("should call factory for contract deployment initiation", async () => {
    mockCreate
      .mockReset()
      .mockImplementationOnce(() => state)
      .mockImplementationOnce(() => contractState);
    await deploy(hre);
    expect(mockGetContractFactory).toHaveBeenCalledWith(name, factoryOptions);
  });

  it("should call plugin lifecycle hooks during deployment", async () => {
    mockCreate
      .mockReset()
      .mockImplementationOnce(() => state)
      .mockImplementationOnce(() => contractState);
    await deploy(hre);

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      Hooks.BEFORE_DEPLOYMENT,
      hre,
      state,
      undefined,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      Hooks.BEFORE_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      3,
      Hooks.AFTER_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      4,
      Hooks.BEFORE_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      5,
      Hooks.AFTER_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      6,
      Hooks.AFTER_DEPLOYMENT,
      hre,
      state,
      undefined,
    );
  });

  it("should not deploy already deployed contract if constructor arguments hasn't changed", async () => {
    const customState = {
      value: () => ({
        ctx: {
          [name]: {
            factoryByteCode: "bytecode",
            args: constructorArguments,
          },
        },
        deployedContracts: [],
      }),
      update: mockUpdateState,
    };

    mockCreate
      .mockReset()
      .mockImplementationOnce(() => customState)
      .mockImplementationOnce(() => contractState);

    await deploy(hre);
    expect(mockGetContractFactory).toHaveBeenCalled();
    expect(mockContractDeploy).not.toHaveBeenCalled();
  });

  it("should not deploy already deployed contract if constructor arguments has changed", async () => {
    const newArgs = ["1"];
    const customState = {
      value: () => ({
        ctx: {
          [name]: {
            factoryByteCode: "bytecode",
            args: newArgs,
          },
        },
        deployedContracts: [],
      }),
      update: mockUpdateState,
    };
    mockCreate
      .mockReset()
      .mockImplementationOnce(() => customState)
      .mockImplementationOnce(() => contractState);

    await deploy(hre);
    expect(mockGetContractFactory).toHaveBeenCalled();
    expect(mockContractDeploy).toHaveBeenCalledWith(...constructorArguments);
  });
});