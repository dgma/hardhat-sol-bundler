const { deploy } = require("./deploy");
const PluginsManager = require("./PluginsManager");

const mockGetDeployment = jest.fn();
const mockOn = jest.fn();
const mockCreate = jest.fn();

jest.mock("./stateFabric", () => ({
  create: () => mockCreate(),
}));

jest.mock("./utils", () => ({
  getDeployment: (hre) => mockGetDeployment(hre),
}));
jest.mock("./PluginsManager", () => ({
  ...jest.requireActual("./PluginsManager"),
  on: async (...args) => mockOn(...args),
}));

xdescribe("deploy", () => {
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
  };
  const name = "ContractName";
  const factoryOptions = {};
  const constructorArguments = [];

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

    expect(mockGetContractFactory).not.toBeCalled();
  });

  it("should call factory for contract deployment initiation", async () => {
    mockCreate
      .mockReset()
      .mockImplementationOnce(() => state)
      .mockImplementationOnce(() => contractState);
    await deploy(hre);
    expect(mockGetContractFactory).toBeCalledWith(name, factoryOptions);
  });

  it("should call plugin lifecycle hooks during deployment", async () => {
    mockCreate
      .mockReset()
      .mockImplementationOnce(() => state)
      .mockImplementationOnce(() => contractState);
    await deploy(hre);

    expect(mockOn).toHaveBeenNthCalledWith(
      1,
      PluginsManager.Hooks.BEFORE_DEPLOYMENT,
      hre,
      state,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      2,
      PluginsManager.Hooks.BEFORE_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      3,
      PluginsManager.Hooks.AFTER_CONTRACT_BUILD,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      4,
      PluginsManager.Hooks.BEFORE_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      5,
      PluginsManager.Hooks.AFTER_CONTRACT_DEPLOY,
      hre,
      state,
      contractState,
    );
    expect(mockOn).toHaveBeenNthCalledWith(
      6,
      PluginsManager.Hooks.AFTER_DEPLOYMENT,
      hre,
      state,
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
    expect(mockGetContractFactory).toBeCalled();
    expect(mockContractDeploy).not.toBeCalled();
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
    expect(mockGetContractFactory).toBeCalled();
    expect(mockContractDeploy).toBeCalledWith(...constructorArguments);
  });
});
