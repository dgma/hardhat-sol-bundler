const deployDiff = require("./deployDiff");
const createDeploymentContext = require('./context');
const {
  getDeploymentMetadata,
  saveDeploymentMetadataLockFile,
} = require("./metadata");
const { PluginsManager } = require("./plugins");


module.exports = async function solBundler({
  noLockFile,
  deploymentConfig,
  plugins,
  lockfileName,
}) {
  let network, deploymentMetaData, deploymentContext;
  PluginsManager.registerPlugins(plugins);
  if (!noLockFile) {
    network = await hre?.hardhatArguments?.network || 'unknown';
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