import { type HardhatRuntimeEnvironment } from "hardhat/types/runtime";
import { Hooks, type HookKeys } from "../pluginsManager";
import { type IState } from "../state";
import { SupportedProxies } from "./constants";
import { default as deploy } from "./deploy";
import {
  type IGlobalState,
  type IDeployingContractState,
  type ConstructorArgument,
} from "./types";

const mockGetDeployment = jest.fn();
const mockOn = jest.fn();
const mockCreate = jest.fn();
const mockSaveDeployment = jest.fn();
const mockInit = jest.fn();
const mockResolveDeps = jest.fn();
const mockSerialize = jest.fn();

jest.mock("../state", () => ({
  create: () => mockCreate(),
}));

jest.mock("./context", () => ({
  init: () => mockInit(),
  resolveDeps: () => mockResolveDeps(),
  serialize: () => mockSerialize(),
}));

jest.mock("./utils", () => ({
  ...jest.requireActual("./utils"),
  getDeployment: () => mockGetDeployment(),
  saveDeployment: () => mockSaveDeployment(),
}));
jest.mock("../pluginsManager", () => ({
  ...jest.requireActual("../pluginsManager"),
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
    mockGetDeployment.mockImplementation(() => ({
      config: {
        [name]: {
          args: constructorArguments,
        },
      },
    }));
    mockCreate
      .mockReset()
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
    await deploy(hre);
    expect(mockGetContractFactory).toHaveBeenCalledWith(name, factoryOptions);
  });

  it("should call plugin lifecycle hooks during deployment", async () => {
    await deploy(hre);

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      Hooks.BEFORE_CONTEXT_INITIALIZATION,
      hre,
      state,
      undefined,
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      Hooks.BEFORE_DEPLOYMENT,
      hre,
      state,
      undefined,
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      3,
      Hooks.BEFORE_DEPENDENCY_RESOLUTION,
      hre,
      state,
      contractState,
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      4,
      Hooks.BEFORE_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      5,
      Hooks.AFTER_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      6,
      Hooks.BEFORE_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      7,
      Hooks.AFTER_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      8,
      Hooks.AFTER_CONTEXT_SERIALIZATION,
      hre,
      state,
      contractState,
    );

    expect(mockOn).toHaveBeenNthCalledWith(
      9,
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

  describe("UUPSUpgradeable openzeppelin proxy", () => {
    const unsafeAllow = ["external-library-linking"];

    const mockDeployProxy = jest.fn(() => ({
      waitForDeployment: mockWaitForDeployment,
    }));
    const mockUpgradeProxy = jest.fn(() => ({
      waitForDeployment: mockWaitForDeployment,
    }));

    const hre = {
      ethers: {
        getContractFactory: mockGetContractFactory,
      },
      upgrades: {
        deployProxy: mockDeployProxy,
        upgradeProxy: mockUpgradeProxy,
      },
    } as any;

    beforeEach(() => {
      mockGetDeployment.mockImplementation(() => ({
        config: {
          ContractName: {
            proxy: {
              type: SupportedProxies.CLASSIC,
              unsafeAllow,
            },
            args: constructorArguments,
          },
        },
      }));
    });
    it("should support deployment deployment with initializer", async () => {
      await deploy(hre);

      expect(mockDeployProxy).toHaveBeenCalledWith(
        contractState.value().factory,
        constructorArguments,
        {
          unsafeAllow,
        },
      );
      expect(mockUpgradeProxy).not.toHaveBeenCalled();
      expect(mockWaitForDeployment).toHaveBeenCalled();
    });

    it("should support upgrade with initializer", async () => {
      const proxyAddress = `0x${name}`;
      const customState = {
        value: () => ({
          ctx: {
            [name]: {
              factoryByteCode: "already-deployed-bytecode",
              args: constructorArguments,
              address: proxyAddress,
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

      expect(mockUpgradeProxy).toHaveBeenCalledWith(
        proxyAddress,
        contractState.value().factory,
        {
          call: {
            fn: "upgradeCallBack",
            args: constructorArguments,
          },
          unsafeAllow,
        },
      );
      expect(mockDeployProxy).not.toHaveBeenCalled();
      expect(mockWaitForDeployment).toHaveBeenCalled();
    });
  });
});
