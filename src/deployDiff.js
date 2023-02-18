const createDeploymentStack = require("./deploymentStack");
const { composeFromEntires } = require("./utils");
const { Hooks, PluginsManager } = require("./plugins");

const createFactoryDeps = (deployer) => {
  if (deployer.contractSchema.libs) {
    return {
      libraries: deployer.contractSchema.libs.reduce(
        (acc, library) => ({
          ...acc,
          [library]: deployer.context[library].address
        }),
        {}
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
  dependencies: deploymentItemConfig.libs || [],
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
    (promise, contractToDeploy) =>
      promise.then(async () => {

        deployer.contractSchema = deployer.config[contractToDeploy];

        createDeploymentConfig(deployer);

        await PluginsManager.on(Hooks.BEFORE_CONTRACT_BUILD, deployer);
        
        const ContractFactory = await ethers.getContractFactory(
          contractToDeploy,
          deployer.contractSchema.factoryDeps
        );

        if (
          deployer.context[contractToDeploy] &&
          ContractFactory.bytecode ===
          deployer.context[contractToDeploy].factoryByteCode
        ) {
          return;
        }

        const contract = await ContractFactory.deploy(
          ...deployer.contractSchema.deploymentArgs
        );
        await contract.deployed();

        deployer.context[contractToDeploy] = {
          address: contract.address,
          interface: contract.interface,
          factoryByteCode: ContractFactory.bytecode,
        };

        return deployedContracts.push(contractToDeploy);
      }),
    Promise.resolve({})
  );

  return [deployedContracts, deployer.context];
};
