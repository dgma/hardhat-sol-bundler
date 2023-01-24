const createDeploymentStack = require("./deploymentStack");
const { composeFromEntires } = require("./utils");
const { Hooks, PluginsManager } = require("./plugins");

const createFactoryDeps = (deployer) => {
  if (deployer.contractSchema.libs) {
    return {
      libraries: composeFromEntires(
        Object.entries(deployer.contractSchema.libs),
        (libraryKey) => deployer.context[libraryKey].address
      ),
    };
  }
  return {};
};

const createDeploymentConfig = (deployer) => {
  deployer.contractSchema.factoryDeps = createFactoryDeps(deployer);
  deployer.contractSchema.deploymentArgs = deployer.contractSchema.deploymentArgs ?? [];
};

const extendConfigWithLibDeps = (deploymentItemConfig) => ({
  ...deploymentItemConfig,
  dependencies: Object.values(deploymentItemConfig.libs || {}),
});

module.exports = async function deployDiff(
  initDeploymentContext = {},
  initDeploymentConfig = {}
) {
  const deployer = {
    context: {
      ...initDeploymentContext,
    },
    config: composeFromEntires(
      Object.entries(initDeploymentConfig),
      extendConfigWithLibDeps
    ),
  }

  await PluginsManager.on(Hooks.BEFORE_CREATE_DEPLOYMENT_STACK, deployer);

  const deploymentStack = createDeploymentStack(deployer.config);

  const deployedContracts = [];
  await deploymentStack.reduce(
    (promise, contractToDeployKey) =>
      promise.then(async () => {

        deployer.contractSchema = deployer.config[contractToDeployKey];

        createDeploymentConfig(deployer);

        await PluginsManager.on(Hooks.BEFORE_CONTRACT_BUILD, deployer);
        
        const ContractFactory = await ethers.getContractFactory(
          deployer.contractSchema.name,
          deployer.contractSchema.factoryDeps
        );

        if (
          deployer.context[contractToDeployKey] &&
          ContractFactory.bytecode ===
          deployer.context[contractToDeployKey].factoryByteCode
        ) {
          return;
        }

        const contract = await ContractFactory.deploy(
          ...deployer.contractSchema.deploymentArgs
        );
        await contract.deployed();

        deployer.context[contractToDeployKey] = {
          address: contract.address,
          interface: contract.interface,
          factoryByteCode: ContractFactory.bytecode,
        };

        return deployedContracts.push(contractToDeployKey);
      }),
    Promise.resolve({})
  );

  return [deployedContracts, deployer.context];
};
