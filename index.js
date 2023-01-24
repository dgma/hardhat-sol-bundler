const deployDiff = require("./src/deployDiff");
const createDeploymentContext = require('./src/context');
const {
  getDeploymentMetadata,
  saveDeploymentMetadataLockFile,
} = require("./src/metadata");
const { Hooks, PluginsManager } = require("./src/plugins");


async function contractDiffDeployer({
  noLockFile,
  deploymentConfig,
  plugins,
  lockfileName,
}) {
  let network, deploymentMetaData, deploymentContext;
  PluginsManager.registerPlugins(plugins);
  if (!noLockFile) {
    network = await ethers.getDefaultProvider().getNetwork();
    // deploymentMetaData is a substract of deploymentContext without interface
    deploymentMetaData = getDeploymentMetadata(lockfileName);

    deploymentContext = await createDeploymentContext(
      deploymentMetaData[network.name],
      deploymentConfig
    );
  }

  const [deployedContracts, newDeploymentContext] = await deployDiff(
    deploymentContext,
    deploymentConfig
  );

  if (!noLockFile) {
    saveDeploymentMetadataLockFile({
      deploymentMetaData,
      newDeploymentContext,
      network,
      lockfileName,
    });
  }

  return [deployedContracts, newDeploymentContext];
}

module.exports = {
  contractDiffDeployer,
  Hooks: Hooks,
};
